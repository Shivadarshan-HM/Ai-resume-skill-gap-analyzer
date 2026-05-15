const { initAdmin } = require('./_utils/firebaseAdmin');
const fetch = require('node-fetch');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed');

  try {
    const admin = initAdmin();
    const db = admin.firestore();

    const authHeader = req.headers.authorization || '';
    const match = authHeader.match(/^Bearer (.+)$/);
    if (!match) return res.status(401).json({ error: 'Missing Authorization Bearer token' });
    const idToken = match[1];
    const decoded = await admin.auth().verifyIdToken(idToken);
    const uid = decoded.uid;

    const { message, analysisId } = req.body || {};
    if (!message) return res.status(400).json({ error: 'message required' });

    // Save user message
    await db.collection('chat_messages').add({ uid, role: 'user', content: message, createdAt: admin.firestore.FieldValue.serverTimestamp() });

    // Load latest analysis if not provided
    let analysis = null;
    if (analysisId) {
      const doc = await db.collection('resume_analyses').doc(analysisId).get();
      if (doc.exists) analysis = doc.data();
    } else {
      const snaps = await db.collection('resume_analyses').where('uid','==',uid).orderBy('createdAt','desc').limit(1).get();
      analysis = snaps.empty ? null : snaps.docs[0].data();
    }

    const contextText = analysis?.analysis?.chat_context || analysis?.analysis || '';
    const prompt = `You are an AI career assistant. Use the analysis context to inform your reply.\n\nContext:\n${contextText}\n\nUser message:\n${message}`;

    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey) return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });

    const geminiResp = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-goog-api-key': geminiKey },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    });

    if (!geminiResp.ok) {
      const txt = await geminiResp.text();
      return res.status(502).json({ error: 'Gemini error', details: txt });
    }

    const geminiJson = await geminiResp.json();
    let replyText = JSON.stringify(geminiJson);
    try {
      const candidate = geminiJson?.candidates?.[0];
      if (candidate && candidate.content) replyText = Array.isArray(candidate.content)?candidate.content.map(p=>p.text||'').join(''):String(candidate.content);
      else if (geminiJson?.outputs?.[0]?.content) {
        const parts = geminiJson.outputs[0].content; replyText = Array.isArray(parts)?parts.map(p=>p.text||'').join(''):String(parts);
      }
    } catch (e) {}

    // Save assistant reply
    await db.collection('chat_messages').add({ uid, role: 'assistant', content: replyText, createdAt: admin.firestore.FieldValue.serverTimestamp() });

    return res.json({ reply: replyText });
  } catch (err) {
    console.error('chat error', err);
    return res.status(500).json({ error: String(err?.message || err) });
  }
};
