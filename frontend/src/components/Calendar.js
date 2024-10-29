import React, { useState, useEffect } from "react";
import "../styles/Calendar.css";
import BackButton from "./BackButton";

const Calendar = () => {
  const [selectedDay, setSelectedDay] = useState(null);
  const [meals, setMeals] = useState([]);
  const [macros, setMacros] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
  });
  const [mealsName] = useState([
    "Śniadanie",
    "II Śniadanie",
    "Obiad",
    "Podwieczorek",
    "Kolacja",
  ]);

  useEffect(() => {
    const savedDietPlan = JSON.parse(localStorage.getItem("dietPlan")) || {};
    const savedMacros = JSON.parse(localStorage.getItem("macros")) || {};

    if (savedMacros) {
      setMacros(savedMacros);
    }

    if (selectedDay !== null && savedDietPlan[selectedDay]) {
      setMeals(savedDietPlan[selectedDay].meals);
    }
  }, [selectedDay]);

  const handleDayClick = (day) => {
    setSelectedDay(day);
  };

  const calculateDailyMacros = () => {
    return meals.reduce(
      (acc, meal) => {
        acc.calories += Math.ceil(meal.kaloryczność); // Zaokrąglenie kalorii
        acc.protein += Math.ceil(meal.białko); // Zaokrąglenie białka
        acc.carbs += Math.ceil(meal.węglowodany); // Zaokrąglenie węglowodanów
        acc.fats += Math.ceil(meal.tłuszcze); // Zaokrąglenie tłuszczy
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );
  };

  const dailyMacros = calculateDailyMacros();

  return (
    <div className="calendar-container">
      <BackButton className="back-button-calendar" />
      <h2>Kalendarz Diety</h2>
      <div className="calendar-grid">
        {Array.from({ length: 30 }, (_, index) => (
          <button key={index + 1} onClick={() => handleDayClick(index + 1)}>
            Dzień {index + 1}
          </button>
        ))}
      </div>
      {selectedDay && (
        <div className="meals-display">
          <h3>Posiłki na dzień {selectedDay}:</h3>
          {meals.length ? (
            meals.map((meal, index) => (
              <div key={index} className="meal-item">
                <h4>{mealsName[index]}</h4> {/* Wyświetlanie nazwy posiłku */}
                <p>{meal.nazwa}</p>
                <p>Kalorie: {Math.ceil(meal.kaloryczność)} kcal</p>
                <p>Białko: {Math.ceil(meal.białko)} g</p>
                <p>Węglowodany: {Math.ceil(meal.węglowodany)} g</p>
                <p>Tłuszcze: {Math.ceil(meal.tłuszcze)} g</p>
                <p>Przepis: {meal.krótkiPrzepis}</p>
                <p>Składniki: {meal.składniki}</p>
              </div>
            ))
          ) : (
            <p>Brak posiłków na ten dzień.</p>
          )}
          <h4>Podsumowanie makroskładników:</h4>
          <p>Kalorie: {dailyMacros.calories} kcal</p>
          <p>Białko: {dailyMacros.protein} g</p>
          <p>Węglowodany: {dailyMacros.carbs} g</p>
          <p>Tłuszcze: {dailyMacros.fats} g</p>
        </div>
      )}
    </div>
  );
};

export default Calendar;
