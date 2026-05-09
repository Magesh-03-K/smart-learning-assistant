import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";

export default function Home() {
  const [goal, setGoal] = useState("");
  const navigate = useNavigate();

  const handleSubmit = () => {
    if (!goal) return alert("Enter a goal");

    navigate(`/result?goal=${goal}`);
  };

  return (
    <div className="container" style={{ textAlign: "center" }}>
      <h1 style={{ textAlign: "center", marginBottom: "20px" }}>Smart Learning Assistant</h1>

      <input
        type="text"
        placeholder="Learn Python in 10 days"
        value={goal}
        onChange={(e) => setGoal(e.target.value)}
        style={{
        padding: "12px",
        width: "300px",
        borderRadius: "8px",
        border: "1px solid #ccc",
        marginRight: "10px"
      }}
      />

      <button onClick={handleSubmit} 
      style={{
        padding: "12px 16px",
        borderRadius: "8px",
        border: "none",
        backgroundColor: "#2563eb",
        color: "white",
        cursor: "pointer"
      }}>
        Generate Plan
      </button>
    </div>
  );
}