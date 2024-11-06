require("dotenv").config(); // Ładowanie zmiennych z pliku .env
const express = require("express");
const path = require("path");
const cors = require("cors");
const jwt = require("jsonwebtoken"); // JWT do obsługi tokenów
const bcrypt = require("bcryptjs"); // Bcrypt do hashowania haseł
const { MongoClient, ObjectId } = require("mongodb"); // MongoClient z natywnego klienta MongoDB

const app = express(); // Tworzenie instancji aplikacji Express

app.use(express.json()); // Umożliwia parsowanie JSON w ciele żądań

// Konfiguracja CORS
app.use(
  cors({
    origin: "http://localhost:3000", // Zezwalanie na żądania z frontendu
  })
);

// Dostęp do zmiennych środowiskowych
const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017";
const JWT_SECRET = process.env.JWT_SECRET; // Klucz JWT z pliku .env
const port = process.env.PORT || 5000;

// Połączenie z MongoDB przy użyciu natywnego klienta
let db; // Utworzenie zmiennej do przechowywania połączenia z bazą danych
MongoClient.connect(mongoURI)
  .then((client) => {
    db = client.db("Dieta"); // Połącz się z bazą danych "Dieta"
    console.log("Połączono z MongoDB");
  })
  .catch((err) => console.log("Błąd podczas łączenia z MongoDB", err));

// Kolekcje posiłków
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
    const existingUser = await db.collection("users").findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Użytkownik już istnieje" });
    }

    // Haszowanie hasła
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tworzenie nowego użytkownika
    const newUser = { username, email, password: hashedPassword };
    await db.collection("users").insertOne(newUser);

    res.status(201).json({ message: "Użytkownik utworzony pomyślnie" });
  } catch (error) {
    res.status(500).json({ message: "Błąd podczas rejestracji użytkownika" });
  }
});

// Logowanie użytkownika
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Znalezienie użytkownika po e-mailu
    const user = await db.collection("users").findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Nieprawidłowe dane logowania" });
    }

    // Sprawdzenie hasła
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Nieprawidłowe dane logowania" });
    }

    // Generowanie tokenu JWT
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" });
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: "Błąd podczas logowania" });
  }
});

// Middleware do weryfikacji tokenu JWT
const authenticateToken = (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) return res.status(401).json({ message: "Brak dostępu" });

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(400).json({ message: "Nieprawidłowy token" });
  }
};

// Dodaj funkcję zabezpieczającą w backendzie w swoim pliku API
app.get("/api/dashboard", authenticateToken, (req, res) => {
  res.json({ message: "Witamy w panelu głównym", user: req.user });
});

// API zabezpieczone JWT - przykład
app.get("/api/secure-data", authenticateToken, (req, res) => {
  res.json({ message: "To są zabezpieczone dane", user: req.user });
});

// API do pobierania posiłków z MongoDB
app.get("/api/Dieta/:mealType", async (req, res) => {
  const mealType = req.params.mealType;

  if (!collections.includes(mealType)) {
    return res.status(400).json({ error: "Nieprawidłowy typ posiłku" });
  }

  try {
    const meals = await db.collection(mealType).find().toArray();

    if (!meals.length) {
      return res.status(404).json({ error: "Brak posiłków dla tego typu" });
    }

    res.json(meals);
  } catch (err) {
    res.status(500).json({ error: "Błąd podczas pobierania posiłków" });
  }
});

// Serwowanie aplikacji React (jeśli jest produkcyjna)
app.use(express.static(path.join(__dirname, "../client/build")));

// Fallback dla nieznanych ścieżek, aby React Router mógł obsługiwać routing
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build/index.html"));
});

// Uruchomienie serwera
app.listen(port, () => {
  console.log(`Serwer działa na porcie ${port}`);
});
