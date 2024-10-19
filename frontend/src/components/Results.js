import React from "react";

const Results = ({ results }) => (
  <section className="results">
    <h2>Wyniki</h2>
    <p>Twoje BMI: {results.bmi}</p>
    <p>Dzienne zapotrzebowanie kaloryczne: {results.calories} kcal</p>
    <p>
      Makroskładniki:
      <br /> Białko - {results.protein} g, Węglowodany - {results.carbohydrates}{" "}
      g, Tłuszcze - {results.fats} g
    </p>
  </section>
);

export default Results;
