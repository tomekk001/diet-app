const mongoose = require("mongoose");

const mealSchema = new mongoose.Schema({
  nazwa: String,
  kaloryczność: Number,
  tłuszcze: Number,
  białko: Number,
  węglowodany: Number,
  krótkiPrzepis: String,
  składniki: String,
  mealType: String, // Powinno zawierać odpowiedni typ posiłku, np. "sniadanie"
});

const Meal = mongoose.model("Meal", mealSchema);
module.exports = Meal;
