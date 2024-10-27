// StoredDiets.js

import React, { useEffect, useState } from "react";
import "../styles/StoredDiets.css";
import BackButton from "./BackButton";

const StoredDiets = () => {
  const [storedDiets, setStoredDiets] = useState([]);

  useEffect(() => {
    const diets = JSON.parse(localStorage.getItem("diets")) || [];
    setStoredDiets(diets);
  }, []);

  return (
    <div>
      <BackButton />
      <h2>Przechowywane Diety</h2>
      {storedDiets.length > 0 ? (
        storedDiets.map((diet, index) => (
          <div key={index} className="diet-container">
            <h3>Dieta {index + 1}</h3>
            {Array.isArray(diet) &&
              diet.map((day, i) => (
                <div key={i} className="day-container">
                  <h4>{day.day}</h4>
                  <ul>
                    {day.meals.map((meal, j) => (
                      <li key={j} className="meal-item">
                        <h4>{meal.nazwa}</h4>
                        <p>Kaloryczność: {meal.kaloryczność} kcal</p>
                        <p>Składniki: {meal.składniki}</p>
                        <p>Przepis: {meal.krótkiPrzepis}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
          </div>
        ))
      ) : (
        <p>Brak zapisanych diet.</p>
      )}
    </div>
  );
};

export default StoredDiets;
