import React, { useState } from "react";
import "../styles/CalculatorBMI.css";

const CalculatorBMI = ({ onCalculate }) => {
  const [formData, setFormData] = useState({
    sex: "male",
    weight: "",
    height: "",
    age: "",
    activity: "1.2",
    goal: "maintain",
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { sex, weight, height, age, activity, goal } = formData;
    const weightFloat = parseFloat(weight);
    const heightFloat = parseFloat(height);
    const ageInt = parseInt(age);
    const activityFloat = parseFloat(activity);

    const newErrors = {};
    if (isNaN(weightFloat) || weightFloat <= 0) {
      newErrors.weight = "Waga musi być dodatnią liczbą.";
    }
    if (weightFloat >= 250) {
      newErrors.weight = "Nieprawidłowa waga.";
    }
    if (isNaN(heightFloat) || heightFloat <= 0) {
      newErrors.height = "Wzrost musi być dodatnią liczbą.";
    }
    if (heightFloat >= 300) {
      newErrors.height = "Nieprawidłowy wzrost.";
    }
    if (isNaN(ageInt) || ageInt <= 0 || ageInt >= 150) {
      newErrors.age = "Nieprawidłowy wiek.";
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const heightInMeters = heightFloat / 100;
    const bmi = weightFloat / (heightInMeters * heightInMeters);
    const bmr =
      sex === "female"
        ? 655.1 + 9.563 * weightFloat + 1.85 * heightFloat - 4.676 * ageInt
        : 66.5 + 13.75 * weightFloat + 5.003 * heightFloat - 6.775 * ageInt;

    let dailyCalories = bmr * activityFloat;
    if (goal === "gain") dailyCalories += 500;
    else if (goal === "lose") dailyCalories -= 500;

    // Zmodyfikowane wyliczanie białka na podstawie celu
    let proteinMultiplier;
    switch (goal) {
      case "gain":
        proteinMultiplier = 2.0; // Więcej białka dla przytycia
        break;
      case "lose":
        proteinMultiplier = 1.5; // Mniej białka dla redukcji
        break;
      default:
        proteinMultiplier = 1.8; // Standardowa wartość dla utrzymania
    }
    const protein = weightFloat * proteinMultiplier;

    const remainingCalories = dailyCalories - protein * 4;
    const carbohydrates = (remainingCalories * 0.55) / 4;
    const fats = (remainingCalories * 0.45) / 9;

    onCalculate({
      bmi: bmi.toFixed(2),
      calories: dailyCalories.toFixed(2),
      protein: Math.floor(protein),
      carbohydrates: Math.floor(carbohydrates),
      fats: Math.floor(fats),
    });
  };

  return (
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
        {errors.weight && <p className="error">{errors.weight}</p>}
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
        {errors.height && <p className="error">{errors.height}</p>}
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
        {errors.age && <p className="error">{errors.age}</p>}
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
  );
};

export default CalculatorBMI;
