# AI Resume Skill Gap Analyzer

A clean full-stack starter project for analyzing resume skill coverage against predefined role requirements.

## Tech Stack

- Frontend: React (functional components)
- Backend: Flask API
- Communication: Fetch API over HTTP

## Project Structure

```text
.
├── backend
│   ├── app.py
│   ├── config.py
│   ├── requirements.txt
│   ├── data
│   │   └── skills.json
│   ├── routes
│   │   └── analyze.py
│   ├── services
│   │   └── skill_engine.py
│   └── utils
│       └── text_cleaner.py
└── frontend
    ├── package.json
    ├── public
    │   └── index.html
    └── src
        ├── App.jsx
        ├── index.js
        ├── components
        ├── pages
        ├── services
        └── styles
```

## Backend Setup

1. Open a terminal in the `backend` folder.
2. Create and activate a virtual environment.
3. Install dependencies:
   - `pip install -r requirements.txt`
4. Start API server:
   - `python app.py`

The API runs at: `http://127.0.0.1:5000`

### Analyze Endpoint

- URL: `POST /analyze`
- Request JSON:

```json
{
  "resume": "Experienced developer with React, JavaScript, and Git...",
  "role": "Frontend Developer"
}
```

- Response JSON:

```json
{
  "match_score": 62.5,
  "found_skills": ["React", "JavaScript", "Git"],
  "missing_skills": ["TypeScript", "HTML", "CSS", "Redux", "REST API"]
}
```

## Frontend Setup

1. Open a terminal in the `frontend` folder.
2. Install dependencies:
   - `npm install`
3. Start the React app:
   - `npm start`

The frontend runs at: `http://localhost:3000`

It sends requests to: `http://127.0.0.1:5000/analyze`
