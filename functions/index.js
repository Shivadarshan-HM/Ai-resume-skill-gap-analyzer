const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { Storage } = require("@google-cloud/storage");
const pdf = require("pdf-parse");
const fetch = require("node-fetch");

admin.initializeApp();
const db = admin.firestore();
const storage = new Storage();

// Read Gemini API key from functions config or environment
const GEMINI_KEY = functions.config()?.google?.api_key || process.env.GOOGLE_API_KEY || null;

async function callGemini(prompt) {
  const apiKey = GEMINI_KEY;
  if (!apiKey) throw new Error("Gemini API key not configured on Functions.");

  const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent";
  const body = {
    contents: [
      {
        parts: [
          {
            text: prompt,
          },
        ],
      },
    ],
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-goog-api-key": apiKey,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Gemini error: ${res.status} ${txt}`);
  }

  const json = await res.json();

  // Try to extract text from common response shapes
  try {
    const candidate = json?.candidates?.[0];
    if (candidate && candidate?.content) {
      const parts = candidate.content;
      if (Array.isArray(parts)) {
        return parts.map((p) => p?.text || "").join("");
      }
      return String(candidate.content);
    }

    const output = json?.outputs?.[0];
    if (output && output?.content) {
      const parts = output.content;
      if (Array.isArray(parts)) return parts.map((p) => p?.text || "").join("");
      return String(output.content);
    }
  } catch (e) {
    // fall through
  }

  return JSON.stringify(json);
}

async function extractTextFromStorage(bucketName, filePath) {
  try {
    const file = storage.bucket(bucketName).file(filePath);
    const [contents] = await file.download();
    const lower = filePath.toLowerCase();
    if (lower.endsWith(".pdf")) {
      const data = await pdf(contents);
      return data.text || "";
    }
    // For other binary formats, return empty and let AI try to work with what it has.
    return contents.toString("utf8");
  } catch (err) {
    console.error("Failed to extract file from storage:", err);
    return "";
  }
}

function buildResumePrompt({ resumeText, role, prompt }) {
  return `You are an expert career coach and resume writer. Given the candidate resume text below and a target role (${role}), produce a JSON object with the following keys: summary (2-3 sentence resume summary tailored to the role), required_skills (array of top skills for role), found_skills (skills found in the resume), missing_skills (skills from required_skills not found), suggestions (array of up to 6 actionable suggestions to close skill gaps), match_score (0-100 integer estimate), highlights (array of 3 bullets showing strong achievements), and chat_context (short helpful context for follow-up assistant replies).\n\nResume Text:\n${resumeText}\n\nUser Prompt:\n${prompt || ""}\n\nRespond with JSON only.`;
}

async function callOpenAI(prompt) {
  if (!openai) throw new Error("OpenAI API key not configured on Functions.");

  const res = await openai.createChatCompletion({
    model: "gpt-4o-mini", // use a generally available model; change via config if needed
    messages: [
      { role: "system", content: "You are a helpful assistant that outputs JSON as requested." },
      { role: "user", content: prompt },
    ],
    max_tokens: 800,
    temperature: 0.2,
  });

  const text = res.data?.choices?.[0]?.message?.content;
  return text;
}

exports.processResume = functions.firestore
  .document("resume_analyses/{docId}")
  .onCreate(async (snap, context) => {
    const data = snap.data();
    const docRef = snap.ref;

    // Only process if status is pending
    if (!data || data.status !== "pending") {
      return null;
    }

    try {
      let resumeText = data.resumeText || "";

      // If a storagePath exists, download and extract text
      if (!resumeText && data.storagePath) {
        const bucketName = admin.storage().bucket().name || functions.config()?.firebase?.storage_bucket || null;
        // Try to get bucket from functions config if admin.storage().bucket() not initialized
        const bucket = admin.storage().bucket();
        const bucketNameResolved = bucket.name || (functions.config()?.firebase?.storage_bucket || null);
        resumeText = await extractTextFromStorage(bucketNameResolved, data.storagePath);
      }

      const prompt = buildResumePrompt({ resumeText, role: data.role || "", prompt: data.prompt || "" });

      let aiOutput = null;
      try {
        const raw = await callGemini(prompt);
        aiOutput = raw;
      } catch (err) {
        console.error("Gemini call failed:", err);
        aiOutput = null;
      }

      let parsed = null;
      if (aiOutput) {
        try {
          parsed = JSON.parse(aiOutput);
        } catch (err) {
          // Try to extract JSON object from text with regex
          const m = aiOutput.match(/\{[\s\S]*\}/m);
          if (m) {
            try {
              parsed = JSON.parse(m[0]);
            } catch (e) {
              parsed = null;
            }
          }
        }
      }

      const analysis = parsed || {
        summary: aiOutput || "AI analysis produced no structured JSON.",
        required_skills: [],
        found_skills: [],
        missing_skills: [],
        suggestions: [],
        match_score: 0,
        highlights: [],
        chat_context: "",
      };

      await docRef.update({
        status: "done",
        analysis,
        ai_raw: aiOutput || null,
        processedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return true;
    } catch (err) {
      console.error("Failed processing resume:", err);
      await docRef.update({
        status: "error",
        error: String(err?.message || err),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      return null;
    }
  });

// Chat processing: when a new user message is written, generate an assistant reply
exports.processChat = functions.firestore
  .document("chat_messages/{msgId}")
  .onCreate(async (snap, context) => {
    const data = snap.data();
    if (!data || data.role !== "user") return null;

    // If already processed by a reply (simple idempotency check) skip
    if (data.processed) return null;

    const uid = data.uid;
    try {
      // Mark the user message as processed to avoid duplicate handling
      await snap.ref.update({ processed: true, processedAt: admin.firestore.FieldValue.serverTimestamp() });

      // Load latest analysis for context
      const analyses = await db
        .collection("resume_analyses")
        .where("uid", "==", uid)
        .orderBy("createdAt", "desc")
        .limit(1)
        .get();

      const latestAnalysis = analyses.empty ? null : analyses.docs[0].data();
      const contextText = latestAnalysis?.analysis?.chat_context || latestAnalysis?.analysis || "";

      // Simple prompt: include user message + context
      const chatPrompt = `You are an AI career assistant. Use the analysis context to inform your reply.\n\nContext:\n${contextText}\n\nUser message:\n${data.content}`;

      const raw = await callGemini(chatPrompt);
      const replyText = raw || "I'm sorry, I couldn't generate a reply right now.";

      // Write assistant message
      await db.collection("chat_messages").add({
        uid,
        role: "assistant",
        content: replyText,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return true;
    } catch (err) {
      console.error("Chat processing failed:", err);
      return null;
    }
  });
