This folder contains Firebase Cloud Functions for AI processing (resume analysis and chat).

Setup:
1. Install dependencies:

```bash
cd functions
npm install
```

2. Configure API keys securely (example for OpenAI):

```bash
firebase functions:config:set openai.key="YOUR_OPENAI_API_KEY"
```

3. Deploy functions:

```bash
firebase deploy --only functions
```

Notes:
- The functions expect uploaded files to be written to Firebase Storage and referenced by `storagePath` in the `resume_analyses` documents.
- The frontend will create a request document with `status: "pending"` and the function will update it with `status: "done"` and `analysis` when complete.
- For Gemini (Google) integration, replace the callOpenAI implementation with Google Generative API calls and set appropriate credentials.
