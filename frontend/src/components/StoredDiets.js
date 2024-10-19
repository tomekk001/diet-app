import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const StoredDiets = () => {
  const navigate = useNavigate(); // Inicjalizacja useNavigate
  const [storedDiets, setStoredDiets] = useState([]);

  // Funkcja, która pobiera diety z localStorage
  useEffect(() => {
    const dietsFromStorage = JSON.parse(localStorage.getItem("diets")) || [];
    setStoredDiets(dietsFromStorage); // Ustawienie stanu przechowywanych diet
  }, []);

  return (
    <div>
      <h2>Przechowywane Diety</h2>
      {/* Sprawdzanie, czy są jakieś przechowywane diety */}
      {storedDiets.length > 0 ? (
        <ul>
          {storedDiets.map((diet, index) => (
            <li key={index}>
              <h3>Dieta {index + 1}</h3>
              <pre>{JSON.stringify(diet, null, 2)}</pre>
            </li>
          ))}
        </ul>
      ) : (
        <p>Brak zapisanych diet.</p>
      )}

      {/* Przycisk powrotu do Dashboard */}
      <button onClick={() => navigate("/dashboard")}>
        Powrót do Dashboard
      </button>
    </div>
  );
};

export default StoredDiets;
