# CVisionary

Full-stack AI resume skill-gap analyzer.

## Stack

- Frontend: React
- Backend: Flask + SQLAlchemy + JWT
- Deployment: Render (backend), Vercel/any static host (frontend)

## Local Setup

### 1. Backend

```bash
cd backend
cp .env.example .env
pip install -r requirements.txt
python app.py
```

Backend runs on `http://127.0.0.1:5000`.

### 2. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm start
```

Frontend runs on `http://localhost:3000`.

## Production Checklist

### Backend Environment (Render)

Set these in Render service env vars:

- `FLASK_DEBUG=false`
- `JWT_SECRET_KEY=<strong-random-secret>`
- `JWT_ACCESS_TOKEN_EXPIRES_DAYS=7`
- `CORS_ORIGINS=<comma-separated frontend origins>`
- `MAIL_USERNAME=<gmail>`
- `MAIL_EMAIL=<gmail>`
- `MAIL_PASSWORD=<gmail app password>`
- `MAIL_DEFAULT_SENDER=<gmail>`
- `ALLOW_OTP_IN_RESPONSE=false`
- `GROQ_API_KEY=<key>` (only for AI features)
- `DATABASE_URL=<managed Postgres connection string>`

### Frontend Environment

- `REACT_APP_API_URL=https://ai-resume-skill-gap-analyzer-axsq.onrender.com`
- `REACT_APP_GOOGLE_CLIENT_ID=<google client id>`

## Render Blueprint

`render.yaml` is included for one-click infra setup (web service + postgres).

## Auth/OTP Notes

- OTP is email-based through SMTP credentials.
- `ALLOW_OTP_IN_RESPONSE` must stay `false` in production.
- If browser shows `Failed to fetch`, first check:
  - backend health `GET /`
  - `CORS_ORIGINS` contains exact frontend URL
  - frontend `REACT_APP_API_URL` is correct

## Security Notes

- Never commit real secrets in `.env`.
- Rotate keys if they were exposed:
  - `JWT_SECRET_KEY`
  - `MAIL_PASSWORD`
  - `GROQ_API_KEY`
