# CVisionary

A full-stack app for comparing a resume against a selected role and highlighting match score, found skills, and missing skills.

## Tech Stack

- Frontend: React
- Backend: Flask
- Communication: Fetch API over HTTP

## Project Structure

```text
.
├── backend
└── frontend
```

## Run the Backend

```bash
cd backend
pip install -r requirements.txt
python app.py
```

The API runs at `http://127.0.0.1:5000`.

## Run the Frontend

```bash
cd frontend
npm install
npm start
```

The frontend runs at `http://localhost:3000`.

## Key Endpoint

- `POST /analyze`
- Request body:

```json
{
  "resume": "Experienced developer with React, JavaScript, and Git...",
  "role": "Frontend Developer"
}
```
