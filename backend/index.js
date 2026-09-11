import express from "express";
import bodyParser from "body-parser";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { uploadFileToGemini, generateVivaQuestions } from "./geminiService.js";

// Load environment variables from .env file
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  console.warn("⚠️ WARNING: API_KEY is not defined in .env file! Please ensure API_KEY is set.");
} else {
  console.log("🔑 Gemini API_KEY loaded successfully from .env");
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
    console.log("✨ 10 Viva Questions generated successfully!");
    console.log("==========================================\n");

    return res.json({
      success: true,
      message: "Material analyzed and 10 viva questions generated successfully by Gemini AI",
      topic: aiResult.topic || fileName.replace(/\.[^/.]+$/, ""),
      summary: aiResult.summary || "Study material successfully analyzed.",
      duration: aiResult.duration || time,
      totalQuestions: aiResult.questions ? aiResult.questions.length : 10,
      questions: aiResult.questions || [],
      fileName,
      filePath: resolvedPath,
      relativePath: path.relative(__dirname, resolvedPath),
      fileSize: stats.size,
      time,
      geminiFileUri: geminiFile.uri,
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

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

