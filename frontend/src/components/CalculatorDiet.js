import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/CalculatorForm.css";
import BackButton from "./BackButton";
import CalculatorBMI from "./CalculatorBMI";

const CalculatorDiet = () => {
  const [results, setResults] = useState(null);
  const [dietPlan, setDietPlan] = useState(null); // Przechowuje plan diety
  const navigate = useNavigate();

  const handleCalculate = (calculatedResults) => {
    setResults(calculatedResults);
  };

  // Pobranie danych o posiłkach z serwera
  const getMealsData = async () => {
    const mealTypes = [
      "sniadanie",
      "iisniadanie",
      "obiad",
      "podwieczorek",
      "kolacja",
    ];
    const mealsData = {};
    for (const mealType of mealTypes) {
      const response = await fetch("http://localhost:5000/api/Dieta/sniadanie");
      const data = await response.json();
      mealsData[mealType] = data;
    }
    return mealsData;
  };

  // Generowanie diety na tydzień
  const generateWeeklyDiet = async () => {
    const daysOfWeek = [
      "Poniedziałek",
      "Wtorek",
      "Środa",
      "Czwartek",
      "Piątek",
      "Sobota",
      "Niedziela",
    ];
    const mealsData = await getMealsData();
    const weeklyDiet = daysOfWeek.map((day) =>
      createDailyDiet(day, mealsData, results)
    );
    setDietPlan(weeklyDiet);
  };

  // Generowanie diety na miesiąc
  const generateMonthlyDiet = async () => {
    const daysOfMonth = Array.from({ length: 30 }, (_, i) => `Dzień ${i + 1}`);
    const mealsData = await getMealsData();
    const monthlyDiet = daysOfMonth.map((day) =>
      createDailyDiet(day, mealsData, results)
    );
    setDietPlan(monthlyDiet);
    navigate("/stored-diets");
  };

  // Funkcja tworząca dzienny plan diety na podstawie wyników i danych o posiłkach
  const createDailyDiet = (
    day,
    mealsData,
    { calories, protein, carbohydrates, fats }
  ) => {
    const mealTypes = [
      "sniadanie",
      "iisniadanie",
      "obiad",
      "podwieczorek",
      "kolacja",
    ];
    const dailyMeals = [];
    let dailyCalories = 0,
      dailyProtein = 0,
      dailyCarbs = 0,
      dailyFats = 0;

    mealTypes.forEach((mealType) => {
      const mealCalories = calculateMealCalories(calories, mealType);
      const selectedMeal = findClosestMeal(
        mealsData[mealType],
        mealCalories,
        protein,
        carbohydrates,
        fats
      );
      if (selectedMeal) {
        dailyMeals.push(selectedMeal);
        dailyCalories += selectedMeal.kaloryczność;
        dailyProtein += selectedMeal.białko;
        dailyCarbs += selectedMeal.węglowodany;
        dailyFats += selectedMeal.tłuszcze;
      }
    });

    return {
      day,
      meals: dailyMeals,
      dailyCalories,
      dailyProtein,
      dailyCarbs,
      dailyFats,
    };
  };

  // Wyliczanie kalorii dla posiłku na podstawie typu posiłku
  const calculateMealCalories = (calories, mealType) => {
    switch (mealType) {
      case "sniadanie":
        return calories * 0.25 + losujBlad();
      case "iisniadanie":
        return calories * 0.15 + losujBlad();
      case "obiad":
        return calories * 0.3 + losujBlad();
      case "podwieczorek":
        return calories * 0.1 + losujBlad();
      case "kolacja":
        return calories * 0.2 + losujBlad();
      default:
        return 0;
    }
  };

  // Wybór najbliższego pasującego posiłku
  const findClosestMeal = (meals, targetCalories, protein, carbs, fats) => {
    let closestMeal = null;
    let minDifference = Number.MAX_VALUE;

    meals.forEach((meal) => {
      const mnoznik = obliczMnoznik(meal.kaloryczność, targetCalories);
      const tempBialko = meal.białko * mnoznik;
      const tempWege = meal.węglowodany * mnoznik;
      const tempTluszcze = meal.tłuszcze * mnoznik;

      const difference =
        Math.abs(tempBialko - protein) +
        Math.abs(tempWege - carbs) +
        Math.abs(tempTluszcze - fats);
      if (difference < minDifference) {
        minDifference = difference;
        closestMeal = {
          ...meal,
          kaloryczność: targetCalories,
          białko: tempBialko,
          węglowodany: tempWege,
          tłuszcze: tempTluszcze,
        };
      }
    });

    return closestMeal;
  };

  const losujBlad = () => Math.random() * 40 - 20;
  const obliczMnoznik = (pierwotnaWartosc, nowaWartosc) =>
    nowaWartosc / pierwotnaWartosc;

  return (
    <div className="container">
      <BackButton />
      <header>
        <h2>Kalkulator BMI i zapotrzebowania kalorycznego</h2>
      </header>
      <main>
        <CalculatorBMI onCalculate={handleCalculate} />
        {results && (
          <section className="results">
            <h2>Wyniki</h2>
            <p id="bmi-result">Twoje BMI: {results.bmi}</p>
            <p id="calories-result">
              Dzienne zapotrzebowanie kaloryczne: {results.calories} kcal
            </p>
            <p id="macronutrients">
              Makroskładniki: Białko - {results.protein} g, Węglowodany -{" "}
              {results.carbohydrates} g, Tłuszcze - {results.fats} g
            </p>
            <button onClick={generateWeeklyDiet}>
              Wygeneruj dietę na tydzień
            </button>
            <button onClick={generateMonthlyDiet}>
              Wygeneruj dietę na miesiąc
            </button>
          </section>
        )}
        {dietPlan && (
          <div>
            <h2>Dieta:</h2>
            {dietPlan.map((dayPlan, index) => (
              <div key={index}>
                <h3>{dayPlan.day}</h3>
                {dayPlan.meals.map((meal, i) => (
                  <div key={i}>
                    <h4>{meal.nazwa}</h4>
                    <p>{meal.kaloryczność} kcal</p>
                    <p>Składniki: {meal.składniki}</p>
                  </div>
                ))}
                <p>Kalorie: {dayPlan.dailyCalories} kcal</p>
                <p>
                  Białko: {dayPlan.dailyProtein} g, Węglowodany:{" "}
                  {dayPlan.dailyCarbs} g, Tłuszcze: {dayPlan.dailyFats} g
                </p>
              </div>
            ))}
          </div>
        )}
      </main>
      <footer>
        <p>&copy; 2024 Kalkulator BMI i Zapotrzebowania Kalorycznego</p>
      </footer>
    </div>
  );
};

export default CalculatorDiet;
