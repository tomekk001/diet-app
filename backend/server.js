require("dotenv").config(); // Ładowanie zmiennych z pliku .env
const express = require("express");
const path = require("path");
const cors = require("cors");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken"); // JWT do obsługi tokenów
const bcrypt = require("bcryptjs"); // Bcrypt do hashowania haseł

const app = express(); // Tworzenie instancji aplikacji Express

app.use(express.json()); // Umożliwia parsowanie JSON w ciele żądań

// Konfiguracja CORS
app.use(
  cors({
    origin: "http://localhost:3000", // Zezwalanie na żądania z frontendu
  })
);

// Dostęp do zmiennych środowiskowych
const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/Dieta";
const JWT_SECRET = process.env.JWT_SECRET; // Klucz JWT z pliku .env
const port = process.env.PORT || 5000;

// Połączenie z MongoDB przy użyciu Mongoose
mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log("Error connecting to MongoDB", err));

// Model użytkownika (User) w MongoDB
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});
const User = mongoose.model("User", userSchema);

// Model posiłków (Meal) w MongoDB
const mealSchema = new mongoose.Schema({
  nazwa: String,
  kaloryczność: Number,
  białko: Number,
  węglowodany: Number,
  tłuszcze: Number,
  składniki: String,
  mealType: String,
});
const Meal = mongoose.model("Meal", mealSchema);

const collections = [
  "sniadanie",
  "iisniadanie",
  "obiad",
  "podwieczorek",
  "kolacja",
];

// Rejestracja użytkownika
app.post("/api/register", async (req, res) => {
  const { username, email, password } = req.body;
  try {
    // Sprawdź, czy użytkownik istnieje
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Haszowanie hasła
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tworzenie nowego użytkownika
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error registering user" });
  }
});

// Logowanie użytkownika
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Znalezienie użytkownika po e-mailu
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Sprawdzenie hasła
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generowanie tokenu JWT
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" });

    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: "Error logging in" });
  }
});

// Middleware do weryfikacji tokenu JWT
const authenticateToken = (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) return res.status(401).json({ message: "Access Denied" });

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(400).json({ message: "Invalid Token" });
  }
};

// API zabezpieczone JWT - przykład
app.get("/api/secure-data", authenticateToken, (req, res) => {
  res.json({ message: "This is secure data", user: req.user });
});

// Serwowanie aplikacji React (jeśli jest produkcyjna)
app.use(express.static(path.join(__dirname, "../client/build")));

// API do pobierania posiłków z MongoDB (przy użyciu Mongoose)
app.get("/api/Dieta/:mealType", async (req, res) => {
  try {
    const mealType = req.params.mealType;
    console.log(mealType);

    // Sprawdzenie, czy mealType jest poprawnym typem posiłku
    if (!collections.includes(mealType)) {
      return res.status(400).json({ error: "Nieprawidłowy typ posiłku" });
    }

    // Pobieranie danych posiłków z bazy MongoDB
    const meals = await Meal.find({ mealType });

    if (!meals.length) {
      return res.status(404).json({ error: "Brak posiłków dla tego typu" });
    }

    res.json(meals);
  } catch (err) {
    console.error("Błąd podczas pobierania posiłków", err);
    res.status(500).json({ error: "Błąd podczas pobierania posiłków" });
  }
});

// Fallback dla nieznanych ścieżek, aby React Router mógł obsługiwać routing
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build/index.html"));
});

// Uruchomienie serwera
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
