import express from "express";
import bodyParser from "body-parser";
import path from "path";
import fs from "fs";
import http from "http";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import pg from "pg";
import { Server } from "socket.io";
import { uploadFileToGemini, generateVivaQuestions, evaluateVivaAnswer } from "./geminiService.js";

// Load environment variables from .env file
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*", methods: ["GET", "POST"] } });
const db = new pg.Client({ user: "postgres", host: "localhost", database: "firstdb", password: process.env.PASSWORD, port: 5432 });

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  console.warn("⚠️ WARNING: API_KEY is not defined in .env file! Please ensure API_KEY is set.");
} else {
  console.log("🔑 Gemini API_KEY loaded successfully from .env");
}

let databaseReady = false;
let tableInfo = null;
const quoteIdentifier = (identifier) => `"${identifier.replaceAll('"', '""')}"`;

async function connectDatabase() {
  try {
    await db.connect();
    const columns = await db.query(`SELECT table_schema, table_name, column_name FROM information_schema.columns WHERE lower(table_name) = lower($1) AND lower(column_name) IN ('sessionid', 'question', 'questions')`, ["PrepMate"]);
    const sessionColumn = columns.rows.find((row) => row.column_name.toLowerCase() === "sessionid");
    const questionsColumn = columns.rows.find((row) => ["question", "questions"].includes(row.column_name.toLowerCase()));
    if (!sessionColumn || !questionsColumn) throw new Error('Table PrepMate must contain sessionID and question (or questions) columns.');
    tableInfo = { schema: sessionColumn.table_schema, table: sessionColumn.table_name, sessionColumn: sessionColumn.column_name, questionsColumn: questionsColumn.column_name };
    databaseReady = true;
    console.log(`🐘 PostgreSQL connected: ${tableInfo.schema}.${tableInfo.table} (${tableInfo.sessionColumn}, ${tableInfo.questionsColumn})`);
  } catch (error) { console.error("❌ PostgreSQL connection failed:", error.message); }
}

function requireDatabase() {
  if (!databaseReady || !tableInfo) throw new Error("PostgreSQL is unavailable. Set PASSWORD in backend/.env, ensure PostgreSQL is running, then restart the backend.");
}

const tableName = () => `${quoteIdentifier(tableInfo.schema)}.${quoteIdentifier(tableInfo.table)}`;
async function saveSession(session) {
  requireDatabase();
  // Each generated question gets its own row; every row has the same sessionID.
  for (const question of session.questions) {
    const record = {
      sessionId: session.sessionId,
      topic: session.topic,
      summary: session.summary,
      duration: session.duration,
      fileName: session.fileName,
      createdAt: session.createdAt,
      question,
    };
    await db.query(`INSERT INTO ${tableName()} (${quoteIdentifier(tableInfo.sessionColumn)}, ${quoteIdentifier(tableInfo.questionsColumn)}) VALUES ($1, $2)`, [session.sessionId, JSON.stringify(record)]);
  }
}
async function loadSession(sessionId) {
  requireDatabase();
  const result = await db.query(`SELECT ${quoteIdentifier(tableInfo.questionsColumn)} AS "sessionData" FROM ${tableName()} WHERE ${quoteIdentifier(tableInfo.sessionColumn)} = $1`, [sessionId]);
  if (!result.rowCount) return null;
  const records = result.rows.map((row) => typeof row.sessionData === "string" ? JSON.parse(row.sessionData) : row.sessionData);
  const first = records[0];
  const questions = records.map((record) => ({ ...record.question, _storedRecord: record })).sort((a, b) => a.id - b.id);
  const currentQuestionIndex = questions.findIndex((question) => !question.answer);
  return {
    sessionId,
    topic: first.topic,
    summary: first.summary,
    duration: first.duration,
    fileName: first.fileName,
    questions,
    currentQuestionIndex: currentQuestionIndex === -1 ? questions.length : currentQuestionIndex,
    status: currentQuestionIndex === -1 ? "completed" : "active",
  };
}
async function updateQuestion(sessionId, question) {
  const previous = question._storedRecord;
  const updated = { ...previous, question: { ...question } };
  delete updated.question._storedRecord;
  await db.query(
    `UPDATE ${tableName()} SET ${quoteIdentifier(tableInfo.questionsColumn)} = $1 WHERE ${quoteIdentifier(tableInfo.sessionColumn)} = $2 AND ${quoteIdentifier(tableInfo.questionsColumn)} = $3`,
    [JSON.stringify(updated), sessionId, JSON.stringify(previous)]
  );
}

async function createIntegerSessionId() {
  // Keep within PostgreSQL INTEGER range and avoid IDs already in PrepMate.
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const sessionId = Math.floor(100_000_000 + Math.random() * 900_000_000);
    const existing = await db.query(
      `SELECT 1 FROM ${tableName()} WHERE ${quoteIdentifier(tableInfo.sessionColumn)} = $1 LIMIT 1`,
      [sessionId]
    );
    if (!existing.rowCount) return sessionId;
  }
  throw new Error("Could not allocate a unique integer sessionID. Please try again.");
}

function publicQuestion(question, number) {
  return {
    number,
    id: question.id,
    question: question.question,
    keyConcept: question.keyConcept,
    difficulty: question.difficulty,
  };
}

app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.json({ limit: "50mb" }));
app.use(express.static("public"));

// Enable CORS for frontend requests
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

app.get("/", (req, res) => {
  res.send("hello");
});

app.post("/material_analysis", async (req, res) => {
  const { fileName, filePath, absolutePath, time, fileContent } = req.body;

  console.log("\n==========================================");
  console.log("📥 Material Analysis Request Received");
  console.log("File Name:", fileName);
  console.log("Duration:", time);
  console.log("Passed File Path:", filePath);
  console.log("Passed Absolute Path:", absolutePath);

  // If base64 content was uploaded, save it to frontend/src/assets so it's a real file on disk
  if (fileContent && fileName) {
    try {
      const base64Data = fileContent.includes(",") ? fileContent.split(",")[1] : fileContent;
      const buffer = Buffer.from(base64Data, "base64");
      const saveDir = path.resolve(__dirname, "../frontend/src/assets");
      if (!fs.existsSync(saveDir)) {
        fs.mkdirSync(saveDir, { recursive: true });
      }
      const savePath = path.join(saveDir, fileName);
      fs.writeFileSync(savePath, buffer);
      console.log("💾 Uploaded file saved to disk:", savePath);
    } catch (saveErr) {
      console.warn("Could not save uploaded file:", saveErr.message);
    }
  }

  // Resolve actual file location on disk
  const candidatePaths = [
    absolutePath,
    filePath ? path.resolve(__dirname, filePath) : null,
    fileName ? path.resolve(__dirname, "../frontend/src/assets", fileName) : null,
    fileName ? path.resolve(process.cwd(), "frontend/src/assets", fileName) : null,
    fileName ? path.resolve(process.cwd(), "../frontend/src/assets", fileName) : null,
  ].filter(Boolean);

  const resolvedPath = candidatePaths.find((p) => fs.existsSync(p));

  if (!resolvedPath) {
    console.warn("⚠️ File not found at candidate paths:", candidatePaths);
    console.log("==========================================\n");

    return res.status(404).json({
      success: false,
      error: "File could not be located on disk",
      fileName,
      time,
      searchedPaths: candidatePaths,
    });
  }

  const stats = fs.statSync(resolvedPath);
  console.log("✅ File verified & accessible by backend!");
  console.log("Actual File Path on Disk:", resolvedPath);
  console.log("File Size:", (stats.size / 1024).toFixed(1), "KB");

  // Check if API_KEY is set
  if (!API_KEY) {
    console.error("❌ Gemini API_KEY is missing from environment variables!");
    return res.status(500).json({
      success: false,
      error: "API_KEY is missing from backend/.env. Please configure your Gemini API_KEY.",
      fileName,
      filePath: resolvedPath,
    });
  }

  try {
    requireDatabase();
    console.log("🚀 Sending file to Google Gemini API for analysis...");
    // 1. Upload the file to Gemini File API
    const geminiFile = await uploadFileToGemini(resolvedPath, API_KEY, fileName);

    // 2. Ask Gemini to analyze it and generate 10 viva questions
    console.log("🤖 Generating 10 viva questions via Gemini AI...");
    const aiResult = await generateVivaQuestions(geminiFile, API_KEY, time);

    if (!Array.isArray(aiResult.questions) || aiResult.questions.length !== 10) {
      throw new Error(
        `Gemini returned ${aiResult.questions?.length ?? 0} questions; expected exactly 10.`
      );
    }

    // This is safe to log: it contains the analysis only, never the API key.
    console.log("📋 Gemini analysis result:", JSON.stringify(aiResult, null, 2));
    const vivaSession = {
      sessionId: await createIntegerSessionId(),
      topic: aiResult.topic || fileName.replace(/\.[^/.]+$/, ""),
      summary: aiResult.summary || "Study material successfully analyzed.",
      duration: aiResult.duration || time,
      fileName,
      geminiFile: { uri: geminiFile.uri, mimeType: geminiFile.mimeType, name: geminiFile.name },
      questions: aiResult.questions,
      currentQuestionIndex: 0,
      status: "ready",
      createdAt: new Date().toISOString(),
    };
    await saveSession(vivaSession);
    console.log(`💾 Viva session ${vivaSession.sessionId} saved to PostgreSQL with 10 questions.`);
    console.log("✨ 10 Viva Questions generated successfully!");
    console.log("==========================================\n");

    return res.json({
      success: true,
      message: "Material analyzed and 10 viva questions generated successfully by Gemini AI",
      topic: aiResult.topic || fileName.replace(/\.[^/.]+$/, ""),
      summary: aiResult.summary || "Study material successfully analyzed.",
      duration: aiResult.duration || time,
      sessionId: vivaSession.sessionId,
      fileName,
      filePath: resolvedPath,
      relativePath: path.relative(__dirname, resolvedPath),
      fileSize: stats.size,
      time,
    });
  } catch (aiError) {
    console.error("❌ Error during Gemini AI analysis:", aiError);
    console.log("==========================================\n");

    return res.status(500).json({
      success: false,
      error: `Gemini AI analysis failed: ${aiError.message}`,
      fileName,
      filePath: resolvedPath,
    });
  }
});

io.on("connection", (socket) => {
  console.log(`🔌 Viva client connected: ${socket.id}`);

  socket.on("viva:start", async ({ sessionId } = {}) => {
    try {
      requireDatabase();
      const session = await loadSession(sessionId);
      if (!session) throw new Error("Viva session was not found.");
      if (session.status === "completed") throw new Error("This viva session has already completed.");
      const question = session.questions[session.currentQuestionIndex];
      socket.emit("viva:started", {
        sessionId: session.sessionId,
        topic: session.topic,
        question: publicQuestion(question, session.currentQuestionIndex + 1),
        totalQuestions: session.questions.length,
      });
      console.log(`🎙️ Viva session ${session.sessionId} started.`);
    } catch (error) {
      socket.emit("viva:error", { message: error.message });
    }
  });

  socket.on("viva:transcript", async ({ sessionId, transcript } = {}) => {
    try {
      requireDatabase();
      if (!transcript?.trim()) throw new Error("A transcript is required for evaluation.");
      const session = await loadSession(sessionId);
      if (!session || session.status === "completed") throw new Error("Start an active viva session before submitting an answer.");
      const index = session.currentQuestionIndex;
      const question = session.questions[index];
      if (!question) throw new Error("No active question remains.");

      socket.emit("viva:evaluating", { questionNumber: index + 1 });
      const evaluation = await evaluateVivaAnswer(question, transcript.trim(), API_KEY);
      question.answer = transcript.trim();
      question.evaluation = evaluation;
      question.answeredAt = new Date().toISOString();
      await updateQuestion(session.sessionId, question);
      const next = session.questions.find((item) => !item.answer);
      socket.emit("viva:evaluation", {
        evaluation,
        nextQuestion: next ? publicQuestion(next, next.id) : null,
        completed: !next,
        totalQuestions: session.questions.length,
      });
      console.log(`📝 Evaluated question ${index + 1} for session ${session.sessionId}.`);
    } catch (error) {
      socket.emit("viva:error", { message: error.message });
    }
  });

  socket.on("disconnect", () => console.log(`🔌 Viva client disconnected: ${socket.id}`));
});

connectDatabase();

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
