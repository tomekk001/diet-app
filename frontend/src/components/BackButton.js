import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/BackButton.css"; // Importowanie pliku CSS

const BackButton = () => {
  const navigate = useNavigate();

  return (
    <button className="back-button" onClick={() => navigate("/dashboard")}>
      ⬅
    </button>
  );
};

export default BackButton;
