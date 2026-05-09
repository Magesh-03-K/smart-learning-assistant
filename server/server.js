import express from "express";
import cors from "cors";
import axios from "axios";

/////////////////////////////////to hide api key from github and other public repos, create a .env file in the server folder with the following content://////
import dotenv from "dotenv";
dotenv.config();
///////////////////////////////////////////////////////////////////////////////

const app = express();

app.use(cors());
app.use(express.json());

const API_KEY = process.env.YOUTUBE_API_KEY;

app.post("/generate-plan", async (req, res) => {
  const { goal } = req.body;

  // extract main keyword (simple version)
  const keyword = goal.toLowerCase();

  const topics = [
    `Introduction to ${keyword}`,
    `${keyword} basics`,
    `${keyword} practice`,
    `${keyword} mini project`
  ];

  const result = [];

  for (let topic of topics) {
    try {
  const yt = await axios.get(
    "https://www.googleapis.com/youtube/v3/search",
    {
      params: {
        key: API_KEY,
        q: goal,
        part: "snippet",
        maxResults: 8,
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

  // split into days
  const result = [
    { topic: "Introduction & Basics", videos: videos.slice(0, 2) },
    { topic: "Practice", videos: videos.slice(2, 4) },
    { topic: "Mini Project", videos: videos.slice(4, 6) },
    { topic: "Advanced Topics", videos: videos.slice(6, 8) },
  ];

  res.json(result);

  

} catch (err) {
  console.log("FULL ERROR:", err.response?.data || err.message);
  result.push({ topic, videos: [] });
}
  }
});

app.listen(5000, () => {
  console.log("Server running");
});