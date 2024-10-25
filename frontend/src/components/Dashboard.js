import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Welcome to the Diet App Dashboard</h1>
      <div style={{ margin: "20px" }}>
        <button
          style={{ fontSize: "24px", padding: "20px", margin: "10px" }}
          onClick={() => navigate("/calculator")}
        >
          Kreator Diety
        </button>
      </div>
      <div style={{ margin: "20px" }}>
        <button
          style={{ fontSize: "24px", padding: "20px", margin: "10px" }}
          onClick={() => navigate("/stored-diets")}
        >
          Przechowywane Diety
        </button>
      </div>
      <div style={{ margin: "20px" }}>
        <button
          style={{ fontSize: "24px", padding: "20px", margin: "10px" }}
          onClick={() => navigate("/calendar")}
        >
          Kalendarz
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
