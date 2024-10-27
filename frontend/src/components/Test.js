// Importy
import React, { useState } from "react";

const Test = () => {
  const [meals, setMeals] = useState([]);
  const [mealType, setMealType] = useState("sniadanie");

  const fetchMeals = async () => {
    try {
      const response = await fetch(
        `http://localhost:27017/api/Dieta/${mealType}`
      );
      if (!response.ok) throw new Error("Błąd podczas pobierania danych");
      const data = await response.json();
      setMeals(data);
    } catch (error) {
      console.error("Error fetching meals:", error);
    }
  };

  return (
    <div>
      <h2>Posiłki: {mealType}</h2>
      <button onClick={fetchMeals}>Pobierz posiłki</button>
      <select onChange={(e) => setMealType(e.target.value)}>
        <option value="sniadanie">Śniadanie</option>
        <option value="iisniadanie">II Śniadanie</option>
        <option value="obiad">Obiad</option>
        <option value="podwieczorek">Podwieczorek</option>
        <option value="kolacja">Kolacja</option>
      </select>
      <div>
        {meals.length > 0 ? (
          meals.map((meal) => (
            <div key={meal._id} className="meal-item">
              <h3>{meal.nazwa}</h3>
              <p>Kaloryczność: {meal.kaloryczność} kcal</p>
              <p>Białko: {meal.białko} g</p>
              <p>Węglowodany: {meal.węglowodany} g</p>
              <p>Tłuszcze: {meal.tłuszcze} g</p>
              <p>Składniki: {meal.składniki}</p>
              <p>Przepis: {meal.krótkiPrzepis}</p>
            </div>
          ))
        ) : (
          <p>Brak posiłków do wyświetlenia</p>
        )}
      </div>
    </div>
  );
};

export default Test;
