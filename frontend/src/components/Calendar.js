import React, { useState, useEffect } from "react";
import "../styles/Calendar.css";
import BackButton from "./BackButton";

const Calendar = () => {
  const [selectedDay, setSelectedDay] = useState(null);
  const [dietPlan, setDietPlan] = useState([]); //stan przechowujacy caly dietPlan
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
    //wczytanie dietPlan i makro
    const savedDietPlan = JSON.parse(localStorage.getItem("dietPlan")) || [];
    const savedMacros = JSON.parse(localStorage.getItem("macros")) || {};

    setDietPlan(savedDietPlan); //ustawianie planu diety
    if (savedMacros) {
      setMacros(savedMacros);
    }
  }, []);

  useEffect(() => {
    //ustawianie posiłkow na podstawie wybranego dnia
    if (selectedDay !== null && dietPlan[selectedDay]) {
      setMeals(dietPlan[selectedDay].meals);
    }
  }, [selectedDay, dietPlan]);

  const handleDayClick = (day) => {
    setSelectedDay(day - 1);
  };

  const calculateDailyMacros = () => {
    return meals.reduce(
      (acc, meal) => {
        acc.calories += Math.ceil(meal.kaloryczność);
        acc.protein += Math.ceil(meal.białko);
        acc.carbs += Math.ceil(meal.węglowodany);
        acc.fats += Math.ceil(meal.tłuszcze);
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
      {selectedDay !== null && (
        <div className="meals-display">
          <h3>Posiłki na dzień {selectedDay + 1}:</h3>
          {meals.length ? (
            meals.map((meal, index) => (
              <div key={index} className="meal-item">
                <h4>{mealsName[index]}</h4>
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
