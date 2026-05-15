const admin = require('firebase-admin');

let initialized = false;

function initAdmin() {
  if (initialized) return admin;

  // Expect service account JSON base64-encoded in env FIREBASE_SERVICE_ACCOUNT
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT || null;
  if (!raw) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT env required (base64-encoded JSON)');
  }

  const json = JSON.parse(Buffer.from(raw, 'base64').toString('utf8'));

  admin.initializeApp({
    credential: admin.credential.cert(json),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || undefined,
  });

  initialized = true;
  return admin;
}

module.exports = { initAdmin };
