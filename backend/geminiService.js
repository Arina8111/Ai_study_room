import fs from 'fs';
import path from 'path';

/**
 * Get MIME type based on file extension
 */
export function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.pptx':
      return 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
    case '.ppt':
      return 'application/vnd.ms-powerpoint';
    case '.pdf':
      return 'application/pdf';
    case '.docx':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case '.doc':
      return 'application/msword';
    case '.txt':
      return 'text/plain';
    case '.md':
      return 'text/markdown';
    case '.csv':
      return 'text/csv';
    case '.png':
      return 'image/png';
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.webp':
      return 'image/webp';
    default:
      return 'application/octet-stream';
  }
}

/**
 * Upload a file to Google Gemini File API
 */
export async function uploadFileToGemini(filePath, apiKey, displayName) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found at path: ${filePath}`);
  }

  const fileStats = fs.statSync(filePath);
  const fileBytes = fs.readFileSync(filePath);
  const mimeType = getMimeType(filePath);
  const fileName = displayName || path.basename(filePath);

  console.log(`[Gemini File API] Starting upload: ${fileName} (${(fileStats.size / 1024).toFixed(1)} KB, ${mimeType})`);

  const uploadEndpoint = `https://generativelanguage.googleapis.com/upload/v1beta/files?key=${apiKey}`;
  const metadata = JSON.stringify({
    file: {
      display_name: fileName,
      mime_type: mimeType,
    },
  });

  // Step 1: Initialize resumable upload
  const initRes = await fetch(uploadEndpoint, {
    method: 'POST',
    headers: {
      'X-Goog-Upload-Protocol': 'resumable',
      'X-Goog-Upload-Command': 'start',
      'X-Goog-Upload-Header-Content-Length': fileStats.size.toString(),
      'X-Goog-Upload-Header-Content-Type': mimeType,
      'Content-Type': 'application/json',
    },
    body: metadata,
  });

  if (!initRes.ok) {
    const errorText = await initRes.text();
    throw new Error(`Gemini File API init failed (${initRes.status}): ${errorText}`);
  }

  const uploadUrl = initRes.headers.get('x-goog-upload-url');
  if (!uploadUrl) {
    throw new Error('Gemini did not return an upload URL (x-goog-upload-url).');
  }

  // Step 2: Upload file bytes and finalize
  const uploadRes = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      'Content-Length': fileStats.size.toString(),
      'X-Goog-Upload-Offset': '0',
      'X-Goog-Upload-Command': 'upload, finalize',
    },
    body: fileBytes,
  });

  if (!uploadRes.ok) {
    const errorText = await uploadRes.text();
    throw new Error(`Gemini File upload failed (${uploadRes.status}): ${errorText}`);
  }

  const uploadData = await uploadRes.json();
  const fileInfo = uploadData.file;
  console.log(`[Gemini File API] Upload successful! File URI: ${fileInfo.uri}, State: ${fileInfo.state}`);

  // Step 3: If processing, poll until ACTIVE
  let currentState = fileInfo.state;
  let fileUri = fileInfo.uri;
  let attempts = 0;
  while (currentState === 'PROCESSING' && attempts < 15) {
    attempts++;
    console.log(`[Gemini File API] File is processing, waiting 2s (attempt ${attempts})...`);
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const checkRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/${fileInfo.name}?key=${apiKey}`);
    if (checkRes.ok) {
      const checkData = await checkRes.json();
      currentState = checkData.state;
      if (currentState === 'FAILED') {
        throw new Error('Gemini file processing failed on Google servers.');
      }
    }
  }

  return {
    uri: fileUri,
    mimeType: fileInfo.mimeType || mimeType,
    name: fileInfo.name,
    displayName: fileName,
  };
}

/**
 * Prompt Gemini to analyze the uploaded file and generate 10 viva questions
 */
export async function generateVivaQuestions(geminiFile, apiKey, userDuration = '15 Mins') {
  const models = ['gemini-3.6-flash', 'gemini-2.5-pro', 'gemini-flash-latest'];
  let lastError = null;

  const promptText = `
You are an expert university professor and technical viva examiner conducting an oral examination (viva voce).
The student has selected this material: "${geminiFile.displayName}" for an examination session of duration: "${userDuration}".

Carefully analyze the content of this document or presentation.
Generate exactly 10 high-quality viva questions that test:
1. Fundamental concepts and definitions
2. Architectural differences and nuances
3. Practical implementation details, algorithms, and operations
4. Edge cases, time & space complexities, and advantages/disadvantages
5. Real-world applications and troubleshooting scenarios

Return your response STRICTLY as a valid JSON object with the following structure (no other markdown or text outside the JSON):
{
  "topic": "Name or Title of the Topic from the presentation",
  "summary": "A concise 2-3 sentence overview of what the material covers",
  "duration": "${userDuration}",
  "totalQuestions": 10,
  "questions": [
    {
      "id": 1,
      "question": "Clear, direct viva question",
      "keyConcept": "The core concept or principle being tested",
      "sampleAnswer": "Ideal model answer expected from the candidate (2-4 sentences)",
      "difficulty": "Easy"
    },
    {
      "id": 2,
      "question": "Clear, direct viva question",
      "keyConcept": "The core concept or principle being tested",
      "sampleAnswer": "Ideal model answer expected from the candidate (2-4 sentences)",
      "difficulty": "Medium"
    }
  ]
}

Ensure there are exactly 10 questions in the questions array, with varied difficulties (e.g. 3 Easy, 4 Medium, 3 Hard).
`.trim();

  for (const model of models) {
    try {
      console.log(`[Gemini AI] Requesting analysis & 10 viva questions using model: ${model}...`);
      const generateUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const response = await fetch(generateUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                {
                  file_data: {
                    mime_type: geminiFile.mimeType,
                    file_uri: geminiFile.uri,
                  },
                },
                { text: promptText },
              ],
            },
          ],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.4,
          },
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Model ${model} returned ${response.status}: ${errText}`);
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!rawText) {
        throw new Error('No content returned from Gemini model candidate');
      }

      // Clean rawText if it has markdown formatting
      let cleanJson = rawText.trim();
      if (cleanJson.startsWith('```json')) {
        cleanJson = cleanJson.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
      } else if (cleanJson.startsWith('```')) {
        cleanJson = cleanJson.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      const parsedData = JSON.parse(cleanJson);
      console.log(`[Gemini AI] Successfully generated ${parsedData.questions?.length || 0} viva questions!`);
      return parsedData;
    } catch (err) {
      console.warn(`[Gemini AI] Warning: Failed with model ${model}:`, err.message);
      lastError = err;
    }
  }

  throw new Error(`Failed to generate viva questions with all attempted models. Last error: ${lastError?.message}`);
}

/** Evaluate one submitted viva answer. The question set remains server-side. */
export async function evaluateVivaAnswer(question, transcript, apiKey) {
  const prompt = `You are a fair university viva examiner. Evaluate the student's answer.
Question: ${question.question}
Key concept: ${question.keyConcept || "Not provided"}
Expected answer: ${question.sampleAnswer || "Not provided"}
Student transcript: ${transcript}

Return strictly valid JSON only:
{"score":0,"feedback":"brief helpful feedback","strengths":["..."],"improvements":["..."]}
Score must be an integer from 0 to 10.`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.2 },
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini answer evaluation failed (${response.status}): ${await response.text()}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Gemini returned no evaluation content.");
  const evaluation = JSON.parse(text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/, ""));
  return {
    score: Math.max(0, Math.min(10, Number(evaluation.score) || 0)),
    feedback: evaluation.feedback || "Answer evaluated.",
    strengths: Array.isArray(evaluation.strengths) ? evaluation.strengths : [],
    improvements: Array.isArray(evaluation.improvements) ? evaluation.improvements : [],
  };
}

/** Analyze study material for an active-recall session. */
export async function generateRecallAnalysis(geminiFile, apiKey) {
  const models = ['gemini-3.6-flash', 'gemini-2.5-pro', 'gemini-flash-latest'];
  let lastError = null;
  const promptText = `
You are an expert study coach preparing material for an active-recall session.
Carefully analyze the entire document or presentation named "${geminiFile.displayName}".
Cover all important concepts, definitions, processes, examples, formulas, comparisons, and caveats found in the material. Do not omit major sections.

Return STRICTLY valid JSON, with no markdown or text outside the JSON:
{
  "topic": "Title or main topic from the material",
  "summary": "A concise overview of the whole material",
  "bulletPoints": [
    "Complete, self-contained study point 1",
    "Complete, self-contained study point 2"
  ]
}

Provide a comprehensive but focused set of bulletPoints for the entire material.
`.trim();

  for (const model of models) {
    try {
      console.log(`[Gemini AI] Requesting recall analysis using model: ${model}...`);
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [
              { file_data: { mime_type: geminiFile.mimeType, file_uri: geminiFile.uri } },
              { text: promptText },
            ] }],
            generationConfig: { responseMimeType: 'application/json', temperature: 0.3 },
          }),
        }
      );
      if (!response.ok) throw new Error(`Model ${model} returned ${response.status}: ${await response.text()}`);

      const rawText = (await response.json())?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) throw new Error('No content returned from Gemini model candidate');
      const parsedData = JSON.parse(rawText.trim().replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/, ''));
      if (!Array.isArray(parsedData.bulletPoints) || parsedData.bulletPoints.length === 0) {
        throw new Error('Gemini did not return recall bullet points.');
      }
      return {
        topic: parsedData.topic || geminiFile.displayName.replace(/\.[^/.]+$/, ''),
        summary: parsedData.summary || 'Study material successfully analyzed for active recall.',
        bulletPoints: parsedData.bulletPoints.map(String),
      };
    } catch (err) {
      console.warn(`[Gemini AI] Recall analysis failed with model ${model}:`, err.message);
      lastError = err;
    }
  }
  throw new Error(`Failed to generate recall analysis with all attempted models. Last error: ${lastError?.message}`);
}

/** Compare a student's active recall with the prepared material analysis. */
export async function evaluateRecallResponse(analysis, recallText, apiKey) {
  const prompt = `
You are a precise and encouraging study coach. Compare the student's active-recall response against the reference analysis below.

Reference topic: ${analysis.topic}
Reference summary: ${analysis.summary}
Reference study points:\n${analysis.bulletPoints.map((point, index) => `${index + 1}. ${point}`).join('\n')}

Student's recalled response:\n${recallText}

Judge factual coverage and correctness. Do not penalize wording differences when the meaning is accurate. Identify important missing concepts and factual inaccuracies only; do not invent errors.

Return STRICTLY valid JSON, with no markdown or other text:
{
  "accuracyPercentage": 0,
  "missingTopics": ["important missing topic"],
  "incorrectPoints": ["brief correction of a factual inaccuracy"],
  "strengths": ["accurately recalled concept"],
  "feedback": "brief, specific encouragement",
  "recommendation": "Try again and focus on the missing topics."
}

accuracyPercentage must be an integer from 0 to 100. For scores below 70, recommendation must encourage another attempt. For scores of 70 or above, recommendation must say the recall accuracy is good or very good.
`.trim();

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json', temperature: 0.2 },
      }),
    }
  );
  if (!response.ok) throw new Error(`Gemini recall evaluation failed (${response.status}): ${await response.text()}`);

  const rawText = (await response.json())?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) throw new Error('Gemini returned no recall evaluation.');
  const result = JSON.parse(rawText.trim().replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/, ''));
  const asList = (value) => Array.isArray(value) ? value.map(String).filter(Boolean) : [];
  const accuracyPercentage = Math.max(0, Math.min(100, Math.round(Number(result.accuracyPercentage) || 0)));
  return {
    accuracyPercentage,
    missingTopics: asList(result.missingTopics),
    incorrectPoints: asList(result.incorrectPoints),
    strengths: asList(result.strengths),
    feedback: result.feedback || 'Your recall has been evaluated.',
    recommendation: result.recommendation || (accuracyPercentage < 70
      ? 'It is okay to score lower at first—try again and focus on the missing topics.'
      : 'Well done—your recall accuracy is good.'),
  };
}
