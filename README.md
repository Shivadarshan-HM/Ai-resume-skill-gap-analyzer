# CVisionary

Firebase-powered resume skill-gap analyzer.

## Stack

- Frontend: React
- Backend Services: Firebase Authentication + Firestore
- Deployment: Firebase Hosting / Vercel / any static host

## Local Setup

### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm start
```

Frontend runs on `http://localhost:3000`.

### Frontend Environment

- `REACT_APP_FIREBASE_API_KEY=<firebase-api-key>`
- `REACT_APP_FIREBASE_AUTH_DOMAIN=<project-id>.firebaseapp.com`
- `REACT_APP_FIREBASE_PROJECT_ID=<project-id>`
- `REACT_APP_FIREBASE_STORAGE_BUCKET=<project-id>.firebasestorage.app`
- `REACT_APP_FIREBASE_MESSAGING_SENDER_ID=<sender-id>`
- `REACT_APP_FIREBASE_APP_ID=<firebase-app-id>`
- `REACT_APP_FIREBASE_MEASUREMENT_ID=<measurement-id>`

## Firebase Notes

- Auth state is managed via Firebase Authentication (email/password + Google popup).
- User profile and app data are stored in Firestore.
- Resume analysis and chat logs are written to Firestore using modular Firebase v9 APIs.

## Security Notes

- Never commit real secrets in `.env`.
- Rotate Firebase credentials and provider secrets if exposed.
