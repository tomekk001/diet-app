import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "../styles/StoredDiets.css";
import BackButton from "./BackButton";

const StoredDiets = () => {
  const location = useLocation();
  const { dietPlan, macros } = location.state || {}; // Odbieramy dietPlan i makroskładniki

  // Użyj useState do przechowywania danych
  const [storedDietPlan, setStoredDietPlan] = useState(dietPlan);
  const [storedMacros, setStoredMacros] = useState(macros);
  const [meals] = useState([
    "Śniadanie",
    "II Śniadanie",
    "Obiad",
    "Podwieczorek",
    "Kolacja",
  ]);

  useEffect(() => {
    const savedDietPlan = localStorage.getItem("dietPlan");
    const savedMacros = localStorage.getItem("macros");

    if (savedDietPlan) {
      setStoredDietPlan(JSON.parse(savedDietPlan));
    }
    if (savedMacros) {
      setStoredMacros(JSON.parse(savedMacros));
    }
  }, []);

  if (!storedDietPlan || !storedMacros) {
    return (
      <p>
        Brak wygenerowanej diety lub makroskładników. Wygeneruj dietę z
        kalkulatora.
      </p>
    );
  }

  return (
    <div id="dieta">
      <div className="fixed-back-button">
        <BackButton />
      </div>
      <h2 className="macrosName">Makroskładniki:</h2>
      <p>
        Dzienne zapotrzebowanie kaloryczne: {Math.ceil(storedMacros.calories)}{" "}
        kcal
      </p>
      <p>Białko: {storedMacros.protein} g</p>
      <p>Węglowodany: {storedMacros.carbohydrates} g</p>
      <p>Tłuszcze: {storedMacros.fats} g</p>
      <h2>Wygenerowana dieta na miesiąc:</h2>
      {storedDietPlan.map((dayPlan, index) => (
        <div key={index}>
          <h3>{dayPlan.day}</h3>
          {dayPlan.meals.map((meal, i) => (
            <div key={i} className="meal-item">
              <p className="meal-type">{meals[i]}</p>
              <p className="meal-name">{meal.nazwa}</p>
              <p className="meal-details">
                {Math.ceil(meal.kaloryczność)} kcal
              </p>
              <p className="meal-ingredients">{meal.krótkiPrzepis}</p>
              <p className="meal-ingredients">Składniki: {meal.składniki}</p>
            </div>
          ))}
          <p className="calories-macros">
            Kalorie: {Math.ceil(dayPlan.dailyCalories)} kcal
          </p>
          <p className="calories-macros">
            Białko: {Math.ceil(dayPlan.dailyProtein)} g, Węglowodany:{" "}
            {Math.ceil(dayPlan.dailyCarbs)} g, Tłuszcze:{" "}
            {Math.ceil(dayPlan.dailyFats)} g
          </p>
        </div>
      ))}
    </div>
  );
};

export default StoredDiets;
