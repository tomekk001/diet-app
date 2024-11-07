import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/HomeBackButton.css"; // Importowanie pliku CSS

const HomeBackButton = () => {
  const navigate = useNavigate();

  return (
    <button className="back-button" onClick={() => navigate("/home")}>
      ⬅
    </button>
  );
};

export default HomeBackButton;
