import express from "express";
import cors from "cors";
import axios from "axios";

import { GoogleGenerativeAI } from "@google/generative-ai";

/////////////////////////////////to hide api key from github and other public repos, create a .env file in the server folder with the following content://////
import dotenv from "dotenv";
dotenv.config();
///////////////////////////////////////////////////////////////////////////////

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
});

const app = express();

app.use(cors());
app.use(express.json());

const API_KEY = process.env.YOUTUBE_API_KEY;

app.post("/generate-plan", async (req, res) => {
  const { goal } = req.body;

  const match = goal.match(/\d+/);

  const totalDays = match ? parseInt(match[0]) : 7;

  const cleanGoal = goal.replace(/\d+\s*days?/i, "").trim();

  try {

    ///////////////////////////new///////////////////
    const prompt = `
    Create EXACTLY ${totalDays} topics for learning:
    ${goal}

    RULES:
    - Return ONLY a JSON array
    - Do NOT add explanations
    - Do NOT add markdown
    - Do NOT return fewer or more than ${totalDays} topics

    Example:
    [
      "Topic 1",
      "Topic 2",
      "Topic 3"
    ]
    `;
    let topics = [];

    try {
      const aiResponse = await model.generateContent(prompt);

      const text = aiResponse.response.text();

      const cleanText = text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      topics = JSON.parse(cleanText);

      if (topics.length > totalDays) {
        topics = topics.slice(0, totalDays);
      }

      while (topics.length < totalDays) {
        topics.push(`${goal} - Extra Topic ${topics.length + 1}`);
      }

    } catch (e) {
      console.log("Gemini Failed:", e.message);

  ///////////////////////////////////////////////////
      // Fallback to hardcoded topics if Gemini fails
      topics = [];

      for (let i = 1; i <= totalDays; i++) {
        topics.push(`${goal} - Day ${i}`);
      }

  ////////////////////////////////////////////////////
    }

  ///////////////////////////new///////////////////
    const result = [];

    for (let topic of topics) {
      const yt = await axios.get(
        "https://www.googleapis.com/youtube/v3/search",
        {
          params: {
            key: API_KEY,
            q: `${cleanGoal} ${topic} tutorial`,
            part: "snippet",
            maxResults: 2,
            type: "video",
            videoDuration: "medium",
            relevanceLanguage: "en",
            safeSearch: "strict",
          },
        }
      );

      const videos = yt.data.items
        .filter(item => item.id.videoId)
        .map(item => ({
          title: item.snippet.title,
          link: `https://www.youtube.com/watch?v=${item.id.videoId}`
        }));

      result.push({ topic, videos });
    }
    res.json(result);
  
  } catch (err) {
    console.log("FULL ERROR:", err.response?.data || err.message);
    res.status(500).json({
      error: "Failed to generate learning plan",
    });
  }
});

app.listen(5000, () => {
  console.log("Server running");
});