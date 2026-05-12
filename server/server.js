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

  try {

    ///////////////////////////new///////////////////
    const prompt = `
    Create a 4-day learning roadmap for:
    ${goal}

    Return ONLY JSON array format like:
    ["Topic 1", "Topic 2", "Topic 3", "Topic 4"]
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

    } catch (e) {
      console.log("Gemini Failed:", e.message);

      topics = [
        "Introduction",
        "Basics",
        "Practice",
        "Mini Project",
      ];
    }

  ///////////////////////////new///////////////////
    const result = [];

    for (let topic of topics) {
      const yt = await axios.get(
        "https://www.googleapis.com/youtube/v3/search",
        {
          params: {
            key: API_KEY,
            q: topic,
            part: "snippet",
            maxResults: 2,
            type: "video",
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