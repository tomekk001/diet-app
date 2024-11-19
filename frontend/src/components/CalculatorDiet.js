import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/CalculatorForm.css";
import BackButton from "./BackButton";
import CalculatorBMI from "./CalculatorBMI";

const CalculatorDiet = () => {
  const [results, setResults] = useState(null);
  const navigate = useNavigate();

  const handleCalculate = (calculatedResults) => setResults(calculatedResults);

  const getMealsData = async () => {
    const mealTypes = [
      "sniadanie",
      "iisniadanie",
      "obiad",
      "podwieczorek",
      "kolacja",
    ];
    const requests = mealTypes.map((mealType) =>
      fetch(`http://localhost:5000/api/Dieta/${mealType}`).then((res) =>
        res.json()
      )
    );
    const mealsDataArray = await Promise.all(requests);

    return mealTypes.reduce((acc, mealType, index) => {
      acc[mealType] = mealsDataArray[index];
      return acc;
    }, {});
  };

  const generateMonthlyDiet = async () => {
    const mealsData = await getMealsData();
    const usedMeals = new Set();
    const monthlyDiet = Array.from({ length: 30 }, (_, i) =>
      createDailyDiet(`Dzień ${i + 1}`, mealsData, results, usedMeals)
    );

    localStorage.setItem("dietPlan", JSON.stringify(monthlyDiet));
    localStorage.setItem("macros", JSON.stringify(results));
    navigate("/stored-diets");
  };

  const createDailyDiet = (
    day,
    mealsData,
    { calories, protein, carbohydrates, fats },
    usedMeals
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
    const usedMealsPerDay = new Set();

    mealTypes.forEach((mealType) => {
      const mealCalories = calculateMealCalories(calories, mealType);
      const selectedMeal = findOptimalMeal(
        mealsData[mealType],
        mealCalories,
        protein,
        carbohydrates,
        fats,
        usedMeals,
        usedMealsPerDay
      );

      if (selectedMeal) {
        dailyMeals.push(selectedMeal);
        dailyCalories += selectedMeal.kaloryczność;
        dailyProtein += selectedMeal.białko;
        dailyCarbs += selectedMeal.węglowodany;
        dailyFats += selectedMeal.tłuszcze;
        usedMeals.add(selectedMeal._id);
        usedMealsPerDay.add(selectedMeal._id);
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
    const proportions = {
      sniadanie: 0.25,
      iisniadanie: 0.15,
      obiad: 0.3,
      podwieczorek: 0.1,
      kolacja: 0.2,
    };
    return Math.ceil(calories * (proportions[mealType] || 0) + randomError());
  };

  const findOptimalMeal = (
    meals,
    targetCalories,
    targetProtein,
    targetCarbs,
    targetFats,
    usedMeals,
    usedMealsPerDay
  ) => {
    const shuffledMeals = [...meals].sort(() => Math.random() - 0.5);
    let bestMeal = null;
    let minDifference = Number.MAX_VALUE;

    shuffledMeals.forEach((meal) => {
      if (usedMeals.has(meal._id) || usedMealsPerDay.has(meal._id)) return;

      const multiplier = calculateMultiplier(meal.kaloryczność, targetCalories);
      const adjustedProtein = meal.białko * multiplier;
      const adjustedCarbs = meal.węglowodany * multiplier;
      const adjustedFats = meal.tłuszcze * multiplier;

      const difference = calculateTotalDifference(
        targetProtein,
        targetCarbs,
        targetFats,
        adjustedProtein,
        adjustedCarbs,
        adjustedFats
      );

      if (difference < minDifference) {
        minDifference = difference;
        bestMeal = {
          ...meal,
          kaloryczność: Math.ceil(targetCalories),
          białko: adjustedProtein,
          węglowodany: adjustedCarbs,
          tłuszcze: adjustedFats,
          składniki: adjustIngredients(meal.składniki, multiplier),
        };
      }
    });

    return bestMeal;
  };

  const calculateTotalDifference = (
    targetProtein,
    targetCarbs,
    targetFats,
    actualProtein,
    actualCarbs,
    actualFats
  ) =>
    Math.abs(targetProtein - actualProtein) * 2 +
    Math.abs(targetCarbs - actualCarbs) * 1.3 +
    Math.abs(targetFats - actualFats) * 2.3;

  const randomError = () => Math.random() * 40 - 20;
  const calculateMultiplier = (originalValue, targetValue) =>
    targetValue / originalValue;

  const adjustIngredients = (ingredients, multiplier) =>
    ingredients
      .split(", ")
      .map((ingredient) => {
        const match = ingredient.match(/(.+)\s(\d+)(g|ml)$/i);
        if (match) {
          const [_, name, amount, unit] = match;
          const newAmount = roundToNearestFive(parseFloat(amount) * multiplier);
          return `${name} ${newAmount}${unit}`;
        }
        return ingredient;
      })
      .join(", ");

  const roundToNearestFive = (number) => Math.round(number / 5) * 5;

  return (
    <div className="containerCalculator">
      <BackButton />
      <header>
        <h2>Kalkulator BMI i zapotrzebowania kalorycznego</h2>
      </header>
      <main>
        <CalculatorBMI onCalculate={handleCalculate} />
        {results && (
          <section className="results">
            <h2>Wyniki</h2>
            <p>Twoje BMI: {results.bmi}</p>
            <p>
              Dzienne zapotrzebowanie kaloryczne: {Math.ceil(results.calories)}{" "}
              kcal
            </p>
            <p>
              Makroskładniki: Białko - {results.protein} g, Węglowodany -{" "}
              {results.carbohydrates} g, Tłuszcze - {results.fats} g
            </p>
            <button onClick={generateMonthlyDiet}>
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
