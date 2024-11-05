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
    const daysOfMonth = Array.from({ length: 30 }, (_, i) => `Dzień ${i + 1}`);
    const mealsData = await getMealsData();
    const usedMeals = new Set(); // Zbiór przechowujący posiłki użyte w całym miesiącu

    const monthlyDiet = daysOfMonth.map((day) =>
      createDailyDiet(day, mealsData, results, usedMeals)
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

    const usedMealsPerDay = new Set(); // Posiłki wykorzystane dla danego dnia

    mealTypes.forEach((mealType) => {
      const mealCalories = Math.ceil(calculateMealCalories(calories, mealType));
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
        dailyCalories += Math.ceil(selectedMeal.kaloryczność);
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

  function roundToNearestFive(number) {
    return Math.round(number / 5) * 5;
  }

  function updateIngredients(ingredients, mnoznik) {
    return ingredients
      .split(", ")
      .map((ingredient) => {
        const match = ingredient.match(/(.+)\s(\d+)(g|ml)$/i);
        if (match) {
          const [_, name, amount, unit] = match;
          const newAmount = roundToNearestFive(parseFloat(amount) * mnoznik);
          return `${name} ${newAmount}${unit}`;
        }
        return ingredient;
      })
      .join(", ");
  }

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

      const mnoznik = obliczMnoznik(meal.kaloryczność, targetCalories);
      const tempProtein = meal.białko * mnoznik;
      const tempCarbs = meal.węglowodany * mnoznik;
      const tempFats = meal.tłuszcze * mnoznik;

      const difference = calculateTotalDifference(
        targetProtein,
        targetCarbs,
        targetFats,
        tempProtein,
        tempCarbs,
        tempFats
      );

      if (difference < minDifference) {
        minDifference = difference;
        bestMeal = {
          ...meal,
          kaloryczność: Math.ceil(targetCalories),
          białko: tempProtein,
          węglowodany: tempCarbs,
          tłuszcze: tempFats,
          składniki: updateIngredients(meal.składniki, mnoznik),
        };
      }
    });

    return bestMeal;
  };

  // Funkcja oceny różnicy w makroskładnikach
  const calculateTotalDifference = (
    targetProtein,
    targetCarbs,
    targetFats,
    actualProtein,
    actualCarbs,
    actualFats
  ) => {
    return (
      Math.abs(targetProtein - actualProtein) * 2 + // Podwójna waga dla białka
      Math.abs(targetCarbs - actualCarbs) +
      Math.abs(targetFats - actualFats)
    );
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
              Dzienne zapotrzebowanie kaloryczne: {Math.ceil(results.calories)}{" "}
              kcal
            </p>
            <p id="macronutrients">
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
