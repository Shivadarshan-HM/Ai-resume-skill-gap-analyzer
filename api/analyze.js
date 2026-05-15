const { initAdmin } = require('./_utils/firebaseAdmin');
const formidable = require('formidable');
const pdf = require('pdf-parse');
const fetch = require('node-fetch');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed');

  try {
    // Initialize admin
    const admin = initAdmin();
    const db = admin.firestore();

    // Verify Firebase ID token from Authorization header
    const authHeader = req.headers.authorization || '';
    const match = authHeader.match(/^Bearer (.+)$/);
    if (!match) return res.status(401).json({ error: 'Missing Authorization Bearer token' });
    const idToken = match[1];
    const decoded = await admin.auth().verifyIdToken(idToken);
    const uid = decoded.uid;

    // Parse form-data (supports file uploads and text fields)
    const form = formidable({ multiples: false });
    const parsed = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) return reject(err);
        resolve({ fields, files });
      });
    });

    const { fields, files } = parsed;
    const role = fields.role || '';
    const prompt = fields.prompt || '';
    let resumeText = fields.resumeText || '';

    // If file uploaded, extract text for PDFs
    if (!resumeText && files && files.file) {
      const file = files.file;
      const buf = await fsReadFile(file.filepath);
      const lower = (file.originalFilename || file.name || '').toLowerCase();
      if (lower.endsWith('.pdf')) {
        const data = await pdf(buf);
        resumeText = data.text || '';
      } else {
        // Attempt to decode as utf8 text
        resumeText = buf.toString('utf8');
      }
    }

    // Build prompt for Gemini
    const fullPrompt = `You are an expert career coach. Given resume text and a target role (${role}), produce JSON: {summary, required_skills, found_skills, missing_skills, suggestions, match_score, highlights, chat_context}. Resume:\n${resumeText}\nUser prompt:\n${prompt}`;

    // Call Gemini
    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey) return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });

    const geminiResp = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-goog-api-key': geminiKey },
      body: JSON.stringify({ contents: [{ parts: [{ text: fullPrompt }] }] }),
    });

    if (!geminiResp.ok) {
      const txt = await geminiResp.text();
      return res.status(502).json({ error: 'Gemini error', details: txt });
    }

    const geminiJson = await geminiResp.json();
    // Try to extract text
    let aiText = JSON.stringify(geminiJson);
    try {
      const candidate = geminiJson?.candidates?.[0];
      if (candidate && candidate.content) {
        aiText = Array.isArray(candidate.content) ? candidate.content.map(p=>p.text||'').join('') : String(candidate.content);
      } else if (geminiJson?.outputs?.[0]?.content) {
        const parts = geminiJson.outputs[0].content;
        aiText = Array.isArray(parts) ? parts.map(p=>p.text||'').join('') : String(parts);
      }
    } catch (e) {}

    // Try to parse JSON produced by model
    let parsed = null;
    try { parsed = JSON.parse(aiText); } catch (e) {
      const m = aiText.match(/\{[\s\S]*\}/m);
      if (m) {
        try { parsed = JSON.parse(m[0]); } catch (e2) { parsed = null; }
      }
    }

    const analysis = parsed || { summary: aiText, required_skills: [], found_skills: [], missing_skills: [], suggestions: [], match_score: 0, highlights: [], chat_context: '' };

    // Save to Firestore
    const doc = {
      uid,
      role,
      prompt,
      resumeText,
      analysis,
      ai_raw: aiText,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    const added = await db.collection('resume_analyses').add(doc);
    const saved = await added.get();

    return res.json({ id: saved.id, ...saved.data() });
  } catch (err) {
    console.error('analyze error', err);
    return res.status(500).json({ error: String(err?.message || err) });
  }
};

const fs = require('fs');
function fsReadFile(path) { return new Promise((res, rej) => fs.readFile(path, (e,d)=> e?rej(e):res(d))); }
