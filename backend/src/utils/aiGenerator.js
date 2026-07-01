const { GoogleGenAI } = require('@google/genai');
const env = require('../config/env');

const generateLessonsForCourse = async (title, category, level) => {
  const prompt = `You are an expert curriculum designer. Please generate a course curriculum for a course titled "${title}", in the category "${category || 'General'}", at the "${level || 'Beginner'}" level. 
Return exactly a JSON array of objects representing the lessons. Do NOT wrap the response in markdown blocks (e.g. \`\`\`json). Provide only the raw JSON array.
Each object must have the following fields:
- "title": A string for the lesson title.
- "content": A multiline string containing the lesson content/description (at least 2-3 bullet points).
- "videoUrl": A placeholder YouTube embed URL relevant to the topic (or use "https://www.youtube.com/embed/kqtD5dpn9C8" as a fallback).
- "order": A number indicating the sequential order (1, 2, 3, 4, 5).
Generate exactly 5 lessons.`;

  let rawText;
  try {
    if (!env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not defined in the environment.");
    }
    const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: prompt,
    });
    rawText = response.text.trim();
  } catch (error) {
    console.warn("Gemini generation failed, trying Groq fallback:", error.message);
    if (!env.GROQ_API_KEY) {
      throw new Error("Failed to generate course content: Gemini failed, and no GROQ_API_KEY is defined as fallback.");
    }
    try {
      const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: prompt + '\nReturn the lessons wrapped in a JSON object under the key "lessons": { "lessons": [...] }.' }],
          response_format: { type: "json_object" }
        })
      });
      const data = await groqResponse.json();
      if (!groqResponse.ok) {
        throw new Error(data.error?.message || "Groq API error");
      }
      rawText = data.choices[0].message.content.trim();
    } catch (groqError) {
      console.error("Groq fallback generation error:", groqError);
      throw new Error("Failed to generate course content using AI: both Gemini and Groq fallback failed.");
    }
  }

  try {
    // Clean up potential markdown formatting that the LLM might still apply
    if (rawText.startsWith('```json')) {
      rawText = rawText.substring(7);
    } else if (rawText.startsWith('```')) {
      rawText = rawText.substring(3);
    }
    if (rawText.endsWith('```')) {
      rawText = rawText.substring(0, rawText.length - 3);
    }

    rawText = rawText.trim();
    const parsed = JSON.parse(rawText);
    const lessons = Array.isArray(parsed) ? parsed : (parsed.lessons || []);
    
    // Ensure all lessons have order and standard format
    return lessons.map((t, idx) => ({
      title: t.title || `Lesson ${idx + 1}`,
      content: t.content || "Lesson content goes here.",
      videoUrl: t.videoUrl || "https://www.youtube.com/embed/kqtD5dpn9C8",
      order: typeof t.order === 'number' ? t.order : idx + 1
    }));

  } catch (error) {
    console.error("AI Generation Error:", error);
    throw new Error("Failed to generate course content using AI: " + error.message);
  }
};

module.exports = {
  generateLessonsForCourse
};
