import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/CalculatorForm.css";
import BackButton from "./BackButton";
import CalculatorBMI from "./CalculatorBMI";

const CalculatorDiet = () => {
  const [results, setResults] = useState(null);
  const navigate = useNavigate();

  const handleCalculate = (calculatedResults) => {
    setResults(calculatedResults);
  };

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
      const response = await fetch(
        `http://localhost:5000/api/Dieta/${mealType}`
      );
      const data = await response.json();
      mealsData[mealType] = data;
    }
    return mealsData;
  };

  const generateMonthlyDiet = async () => {
    const daysOfMonth = Array.from({ length: 30 }, (_, i) => `Dzień ${i + 1}`);
    const mealsData = await getMealsData();
    const lastWeekMeals = {}; // Przechowywanie posiłków ostatniego tygodnia
    const monthlyDiet = daysOfMonth.map((day, index) =>
      createDailyDiet(day, mealsData, results, lastWeekMeals, index)
    );

    // Przechowywanie w local storage
    localStorage.setItem("dietPlan", JSON.stringify(monthlyDiet));
    localStorage.setItem("macros", JSON.stringify(results));

    navigate("/stored-diets");
  };

  const createDailyDiet = (
    day,
    mealsData,
    { calories, protein, carbohydrates, fats },
    lastWeekMeals,
    currentIndex
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
      const mealCalories = Math.ceil(calculateMealCalories(calories, mealType));
      const selectedMeal = findClosestMeal(
        mealsData[mealType],
        mealCalories,
        protein,
        carbohydrates,
        fats,
        lastWeekMeals[mealType] || []
      );

      if (selectedMeal) {
        dailyMeals.push(selectedMeal);
        dailyCalories += Math.ceil(selectedMeal.kaloryczność);
        dailyProtein += selectedMeal.białko;
        dailyCarbs += selectedMeal.węglowodany;
        dailyFats += selectedMeal.tłuszcze;

        // Zapisanie wybranego posiłku do ostatniego tygodnia
        if (!lastWeekMeals[mealType]) lastWeekMeals[mealType] = [];
        lastWeekMeals[mealType].push(selectedMeal._id);
        if (lastWeekMeals[mealType].length > 7) lastWeekMeals[mealType].shift();
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

  const findClosestMeal = (
    meals,
    targetCalories,
    protein,
    carbs,
    fats,
    lastWeek
  ) => {
    let closestMeal = null;
    let minDifference = Number.MAX_VALUE;

    meals.forEach((meal) => {
      if (lastWeek.includes(meal._id)) return;

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
          kaloryczność: Math.ceil(targetCalories),
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
            <button onClick={generateMonthlyDiet} id="btnDietCalc">
              Wygeneruj dietę na miesiąc
            </button>
          </section>
        )}
      </main>
      <footer>
        <p>&copy; 2024 Kalkulator BMI i Zapotrzebowania Kalorycznego</p>
      </footer>
    </div>
  );
};

export default CalculatorDiet;
