// CalculatorDiet.js

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

  // Funkcja generująca dietę na cały miesiąc
  const generateMonthlyDiet = async (
    calories,
    protein,
    carbohydrates,
    fats
  ) => {
    const daysOfMonth = Array.from({ length: 30 }, (_, i) => `Dzień ${i + 1}`);
    const mealTypes = [
      "sniadanie",
      "iisniadanie",
      "obiad",
      "podwieczorek",
      "kolacja",
    ];

    const mealsData = await getMealsData();
    const monthlyDiet = [];

    for (const day of daysOfMonth) {
      const dailyMeals = {
        day,
        meals: [],
        dailyCalories: 0,
        dailyProtein: 0,
        dailyCarbs: 0,
        dailyFats: 0,
      };

      for (const mealType of mealTypes) {
        let baseCalories;
        switch (mealType) {
          case "sniadanie":
            baseCalories = calories * 0.25;
            break;
          case "kolacja":
            baseCalories = calories * 0.2;
            break;
          case "iisniadanie":
            baseCalories = calories * 0.15;
            break;
          case "podwieczorek":
            baseCalories = calories * 0.1;
            break;
          case "obiad":
            baseCalories = calories * 0.3;
            break;
          default:
            break;
        }

        let mealCalories = baseCalories + losujBlad();

        let selectedMeal = null;
        let minDifference = Number.MAX_VALUE;

        if (Array.isArray(mealsData[mealType])) {
          for (const meal of mealsData[mealType]) {
            const mnoznik = obliczMnoznik(meal.kaloryczność, mealCalories);
            const tempBialko = meal.białko * mnoznik;
            const tempWege = meal.węglowodany * mnoznik;
            const tempTluszcze = meal.tłuszcze * mnoznik;

            const remainingProtein = protein - dailyMeals.dailyProtein;
            const remainingCarbs = carbohydrates - dailyMeals.dailyCarbs;
            const remainingFats = fats - dailyMeals.dailyFats;

            const difference =
              Math.abs(tempBialko - remainingProtein) +
              Math.abs(tempWege - remainingCarbs) +
              Math.abs(tempTluszcze - remainingFats);

            if (difference < minDifference) {
              minDifference = difference;
              selectedMeal = {
                ...meal,
                kaloryczność: mealCalories,
                białko: tempBialko,
                węglowodany: tempWege,
                tłuszcze: tempTluszcze,
                składniki: updateIngredients(meal.składniki, mnoznik),
              };
            }
          }
        }

        if (selectedMeal) {
          dailyMeals.meals.push(selectedMeal);
          dailyMeals.dailyCalories += selectedMeal.kaloryczność;
          dailyMeals.dailyProtein += selectedMeal.białko;
          dailyMeals.dailyCarbs += selectedMeal.węglowodany;
          dailyMeals.dailyFats += selectedMeal.tłuszcze;
        }
      }

      monthlyDiet.push(dailyMeals);
    }

    return monthlyDiet;
  };

  const handleGenerateDiet = () => {
    const { calories, protein, carbohydrates, fats } = results;

    generateMonthlyDiet(calories, protein, carbohydrates, fats).then(
      (dietData) => {
        const previousDiets = JSON.parse(localStorage.getItem("diets")) || [];
        localStorage.setItem(
          "diets",
          JSON.stringify([...previousDiets, dietData])
        );
        navigate("/stored-diets");
      }
    );
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
      const response = await fetch(`/api/Dieta/${mealType}`);
      const data = await response.json();
      mealsData[mealType] = data;
    }
    return mealsData;
  };

  const losujBlad = () => Math.random() * 40 - 20;
  const obliczMnoznik = (pierwotnaWartosc, nowaWartosc) =>
    nowaWartosc / pierwotnaWartosc;

  const updateIngredients = (ingredients, mnoznik) =>
    ingredients
      .split(", ")
      .map((ingredient) => {
        const match = ingredient.match(/^(\d+(\.\d+)?)\s*(.+)$/);
        if (match) {
          const newAmount = (parseFloat(match[1]) * mnoznik).toFixed(1);
          return `${newAmount} ${match[3]}`;
        }
        return ingredient;
      })
      .join(", ");

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
            <button id="generate-diet-btn" onClick={handleGenerateDiet}>
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
