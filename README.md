# PrepMate

PrepMate is an AI-assisted study companion for turning learning materials into active-recall sessions and viva practice. Upload a document, choose a session length, and use the generated questions to test your understanding.

## Features

- **Active recall** — generate question sets from uploaded learning material, answer them, and receive AI feedback.
- **AI viva sessions** — practice spoken answers in an interactive, socket-powered session.
- **Study overview** — view recent sessions and jump back into learning workflows.
- **Notes and materials** — organize study resources in one place.
- **Session reports** — review results from completed recall and viva sessions.

## Tech stack

- React 19, Vite, Tailwind CSS, React Router, and Socket.IO Client
- Node.js, Express, Socket.IO, PostgreSQL, and Google Gemini

## Project structure

```text
.
├── frontend/          # React + Vite web application
│   └── src/           # Views, components, and styles
└── backend/           # Express API, Socket.IO server, and Gemini integration
```

## Getting started

### Prerequisites

- Node.js 20 or later
- PostgreSQL running locally
- A Google Gemini API key

### 1. Install dependencies

```bash
cd frontend
npm install

cd ../backend
npm install
```

### 2. Configure the backend

Create `backend/.env` with your credentials:

```env
API_KEY=your_gemini_api_key
PASSWORD=your_postgres_password
```

The server connects to PostgreSQL at `localhost:5432`, using database `firstdb` and user `postgres`. It expects a `PrepMate` table containing a `sessionID` column and either a `question` or `questions` column.

### 3. Run the application

In one terminal, start the API server:

```bash
cd backend
node index.js
```

In a second terminal, start the frontend:

```bash
cd frontend
npm run dev
```

Open the local URL shown by Vite (normally `http://localhost:5173`). The backend runs on `http://localhost:3000`.

## API overview

| Endpoint | Purpose |
| --- | --- |
| `POST /material_analysis` | Analyze material and generate questions for a viva session. |
| `POST /recall` | Generate an active-recall session from learning material. |
| `POST /recall/evaluate` | Evaluate an active-recall answer. |

## Note

- Keep `backend/.env` private; it contains credentials and must not be committed.
- Uploaded materials are saved under `frontend/src/assets` by the current backend implementation.
