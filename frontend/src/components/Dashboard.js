import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import CalculatorForm from "./CalculatorForm"; // Zakładam, że ten plik istnieje
import StoredDiets from "./StoredDiets"; // Zakładam, że ten plik istnieje

const Dashboard = () => {
  const [diet, setDiet] = useState(null); // Stan dla diety
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
      {/* Przekazujemy funkcję setDiet do CalculatorForm */}
      <CalculatorForm setDiet={setDiet} /> {/* Kluczowa linia */}
      {/* Jeśli dieta istnieje, wyświetl ją w formie JSON */}
      {diet && (
        <div>
          <h2>Twoja wygenerowana dieta:</h2>
          <pre>{JSON.stringify(diet, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
