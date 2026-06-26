const { GoogleGenAI } = require('@google/genai');

const generateLessonsForCourse = async (title, category, level) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not defined in the environment. Please add it to your .env file to enable AI course generation.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const prompt = `You are an expert curriculum designer. Please generate a course curriculum for a course titled "${title}", in the category "${category || 'General'}", at the "${level || 'Beginner'}" level. 
Return exactly a JSON array of objects representing the lessons. Do NOT wrap the response in markdown blocks (e.g. \`\`\`json). Provide only the raw JSON array.
Each object must have the following fields:
- "title": A string for the lesson title.
- "content": A multiline string containing the lesson content/description (at least 2-3 bullet points).
- "videoUrl": A placeholder YouTube embed URL relevant to the topic (or use "https://www.youtube.com/embed/kqtD5dpn9C8" as a fallback).
- "order": A number indicating the sequential order (1, 2, 3, 4, 5).
Generate exactly 5 lessons.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    let rawText = response.text.trim();
    
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
    const lessons = JSON.parse(rawText);
    
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
