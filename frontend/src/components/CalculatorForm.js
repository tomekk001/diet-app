import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const CalculatorForm = ({ setDiet }) => {
  const [formData, setFormData] = useState({
    sex: "male",
    weight: "",
    height: "",
    age: "",
    activity: "1.2",
    goal: "maintain",
  });

  const [results, setResults] = useState({
    bmi: "",
    calories: "",
    protein: "",
    carbohydrates: "",
    fats: "",
  });

  const [showGenerateButton, setShowGenerateButton] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const { sex, weight, height, age, activity, goal } = formData;
    const weightFloat = parseFloat(weight);
    const heightFloat = parseFloat(height);
    const ageInt = parseInt(age);
    const activityFloat = parseFloat(activity);

    if (
      isNaN(weightFloat) ||
      isNaN(heightFloat) ||
      isNaN(ageInt) ||
      isNaN(activityFloat)
    ) {
      return;
    }

    // Obliczenie BMI
    const heightInMeters = heightFloat / 100;
    const bmi = weightFloat / (heightInMeters * heightInMeters);

    // Obliczenie BMR
    let bmr = 0;
    if (sex === "female") {
      bmr = 655.1 + 9.563 * weightFloat + 1.85 * heightFloat - 4.676 * ageInt;
    } else {
      bmr = 66.5 + 13.75 * weightFloat + 5.003 * heightFloat - 6.775 * ageInt;
    }

    // Obliczenie całkowitego zapotrzebowania kalorycznego
    let dailyCalories = bmr * activityFloat;

    // Zmiana kalorii w zależności od celu
    switch (goal) {
      case "gain":
        dailyCalories += 500;
        break;
      case "lose":
        dailyCalories -= 500;
        break;
      default:
        // Poprawka: Dodajemy default, nawet jeśli nie robimy nic
        break;
    }

    // Białko zawsze wynosi 1.8 g na 1 kg masy ciała
    const protein = weightFloat * 1.8; // w gramach
    const proteinCalories = protein * 4; // 1 g białka = 4 kcal

    // Pozostałe kalorie po odjęciu kalorii z białka
    const remainingCalories = dailyCalories - proteinCalories;

    // Węglowodany: 55% z pozostałych kalorii
    const carbohydrateCalories = remainingCalories * 0.55;
    const carbohydrates = carbohydrateCalories / 4; // 1 g węglowodanów = 4 kcal

    // Tłuszcze: 45% z pozostałych kalorii
    const fatCalories = remainingCalories * 0.45;
    const fats = fatCalories / 9; // 1 g tłuszczu = 9 kcal

    setResults({
      bmi: bmi.toFixed(2),
      calories: dailyCalories.toFixed(2),
      protein: Math.floor(protein),
      carbohydrates: Math.floor(carbohydrates),
      fats: Math.floor(fats),
    });

    setShowGenerateButton(true); // Pokaż przycisk generowania diety po obliczeniu
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
        }

        let mealCalories = baseCalories + losujBlad();

        let selectedMeal = null;
        let minDifference = Number.MAX_VALUE;

        // Poprawka: Sprawdzamy, czy mealsData[mealType] istnieje i jest iterowalne
        if (Array.isArray(mealsData[mealType])) {
          for (const meal of mealsData[mealType]) {
            const tempKalorie = mealCalories;
            const mnoznik = obliczMnoznik(meal.kaloryczność, tempKalorie);
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
                kaloryczność: tempKalorie,
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
        const updatedDiets = [...previousDiets, dietData];
        localStorage.setItem("diets", JSON.stringify(updatedDiets)); // Zapis diety do localStorage
        setDiet(dietData); // Zapisujemy wygenerowaną dietę w stanie rodzica
        navigate("/stored-diets"); // Przekierowanie do strony z zapisanymi dietami
      }
    );
  };

  // Brakujące funkcje
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

  const losujBlad = () => Math.random() * 40 - 20; // Losuje liczbę od -20 do 20

  const obliczMnoznik = (pierwotnaWartosc, nowaWartosc) =>
    nowaWartosc / pierwotnaWartosc;

  const updateIngredients = (ingredients, mnoznik) => {
    return ingredients
      .split(", ")
      .map((ingredient) => {
        const match = ingredient.match(/^(\d+(\.\d+)?)\s*(.+)$/);
        if (match) {
          const [amount, , unit] = match;
          const newAmount = (parseFloat(amount) * mnoznik).toFixed(1);
          return `${newAmount} ${unit}`;
        }
        return ingredient;
      })
      .join(", ");
  };

  return (
    <div className="container">
      <header>
        <h1>Kalkulator BMI i Zapotrzebowania Kalorycznego</h1>
      </header>
      <main>
        <form id="calculator-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="sex">Płeć:</label>
            <select
              name="sex"
              id="sex"
              value={formData.sex}
              onChange={handleChange}
              required
            >
              <option value="male">Mężczyzna</option>
              <option value="female">Kobieta</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="weight">Waga (kg):</label>
            <input
              type="number"
              id="weight"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="height">Wzrost (cm):</label>
            <input
              type="number"
              id="height"
              name="height"
              value={formData.height}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="age">Wiek:</label>
            <input
              type="number"
              id="age"
              name="age"
              value={formData.age}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="activity">Aktywność fizyczna:</label>
            <select
              name="activity"
              id="activity"
              value={formData.activity}
              onChange={handleChange}
              required
            >
              <option value="1.2">
                Znikoma - brak ćwiczeń i siedzący tryb życia
              </option>
              <option value="1.375">
                Niska aktywność fizyczna - 1-2 treningi w tygodniu
              </option>
              <option value="1.65">
                Średnia aktywność fizyczna - 3-4 treningi w tygodniu
              </option>
              <option value="1.9">
                Wysoka aktywność fizyczna - codzienne treningi
              </option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="goal">Cel:</label>
            <select
              id="goal"
              name="goal"
              value={formData.goal}
              onChange={handleChange}
              required
            >
              <option value="gain">Przytycie</option>
              <option value="maintain">Utrzymanie wagi</option>
              <option value="lose">Redukcja</option>
            </select>
          </div>
          <button type="submit" id="calculate-btn">
            Oblicz
          </button>
        </form>
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
          {showGenerateButton && (
            <button id="generate-diet-btn" onClick={handleGenerateDiet}>
              Wygeneruj dietę na miesiąc
            </button>
          )}
        </section>
      </main>
      <footer>
        <p>&copy; 2024 Kalkulator BMI i Zapotrzebowania Kalorycznego</p>
      </footer>
    </div>
  );
};

export default CalculatorForm;
