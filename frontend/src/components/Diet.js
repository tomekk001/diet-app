import React from "react";

const Diet = ({ diet }) => {
  if (!diet) {
    return <p>Loading diet information...</p>; // Możesz dostosować komunikat lub UI dla niezaładowanych danych
  }

  return (
    <section id="dieta">
      <h2>Dieta na cały tydzień:</h2>
      {diet.days.map((day, index) => (
        <div key={index}>
          <h3>{day}</h3>
          {diet.meals.map((meal, idx) => (
            <p key={idx}>
              {meal}: {diet.data[index][idx]}
            </p>
          ))}
        </div>
      ))}
    </section>
  );
};

export default Diet;
