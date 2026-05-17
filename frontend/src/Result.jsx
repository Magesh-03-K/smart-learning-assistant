import { useEffect, useState } from "react";
import "./App.css";

export default function Result() {
  const [plan, setPlan] = useState([]);
  const [completed, setCompleted] = useState({});


  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ✅ Get goal from URL (GLOBAL)
  const params = new URLSearchParams(window.location.search);
  const goal = params.get("goal") || "default";

  // ✅ Toggle checkbox
  const toggleComplete = (index) => {
    setCompleted((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };
  const API_URL = "https://smart-learning-assistant-k9rf.onrender.com";

  // ✅ Fetch plan from backend
  useEffect(() => {
    setLoading(true);

    fetch(`${API_URL}/generate-plan`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ goal }),
    })
      .then((res) => res.json())
      .then((data) => {
        setPlan(data);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);

        setError("Failed to generate roadmap");
        setLoading(false);
      });
  }, [goal]);


  ////////////////////////////////////////////////////////////////////////////////////
  // ✅ Load saved progress (goal-based)
  useEffect(() => {
    if (plan.length === 0) return;

    const saved = localStorage.getItem(goal);
    if (saved) {
      setCompleted(JSON.parse(saved));
    }
  }, [goal, plan.length]);
 //////////////////////////////////////////////////////////////////////////////////////
  // ✅ Save progress
  useEffect(() => {
    if (plan.length === 0) return;

    localStorage.setItem(goal, JSON.stringify(completed));
  }, [completed, goal, plan.length]);
  /////////////////////////////////////////////////////////////////////////////////////
  // ✅ Progress calculation
  const total = plan.length;
  const done = Object.values(completed).filter(Boolean).length;


  if (loading) {
    return (
      <div className="container">
        <h2>🚀 Generating your AI roadmap...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <h2>{error}</h2>
      </div>
    );
  }

  return (
    <div className="container">
      <h2  className="progress">Progress: {done} / {total}</h2>

    

      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${(done / total) * 100}%` }}
        ></div>
      </div>

      
      {plan.map((day, index) => (
        <div key={index} className={`card ${completed[index] ? "done" : ""}`}>
          <div className="day-title">
            <input
              type="checkbox"
              checked={completed[index] || false}
              onChange={() => toggleComplete(index)}
            />
            <h3>Day {index + 1}</h3>
          </div>

          <p className="topic">{day.topic}</p>
          

          <ul>
            {day.videos.map((video, i) => (
              <li key={i}>
                <a href={video.link} 
                  target="_blank" 
                  rel="noreferrer"
                  className="video-link">
                  ▶ {video.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}