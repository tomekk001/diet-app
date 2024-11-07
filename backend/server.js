require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");
const jwt = require("jsonwebtoken"); //jwt do obsługi tokenów
const bcrypt = require("bcryptjs"); //bcrypt do hashowania haseł
const { MongoClient, ObjectId } = require("mongodb"); //mongoclient z natywnego klienta MongoDB

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017";
const JWT_SECRET = process.env.JWT_SECRET;
const port = process.env.PORT || 5000;

let db;
MongoClient.connect(mongoURI)
  .then((client) => {
    db = client.db("Dieta");
    console.log("Połączono z MongoDB");
  })
  .catch((err) => console.log("Błąd podczas łączenia z MongoDB", err));

const collections = [
  "sniadanie",
  "iisniadanie",
  "obiad",
  "podwieczorek",
  "kolacja",
];

app.post("/api/register", async (req, res) => {
  const { username, email, password } = req.body;
  try {
    //czy uztykownik istnieje
    const existingUser = await db.collection("users").findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Użytkownik już istnieje" });
    }

    //haszowanie
    const hashedPassword = await bcrypt.hash(password, 10);

    //tworzenie nowego uzytkownika
    const newUser = { username, email, password: hashedPassword };
    await db.collection("users").insertOne(newUser);

    res.status(201).json({ message: "Użytkownik utworzony pomyślnie" });
  } catch (error) {
    res.status(500).json({ message: "Błąd podczas rejestracji użytkownika" });
  }
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    //znalezienie uzytkownika po adresie email
    const user = await db.collection("users").findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Nieprawidłowe dane logowania" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Nieprawidłowe dane logowania" });
    }

    //generowanie tokena jwt
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" });
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: "Błąd podczas logowania" });
  }
});

//middelware do weryfikacji tokenu jwt
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

app.get("/api/dashboard", authenticateToken, (req, res) => {
  res.json({ message: "Witamy w panelu głównym", user: req.user });
});

app.get("/api/secure-data", authenticateToken, (req, res) => {
  res.json({ message: "To są zabezpieczone dane", user: req.user });
});

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

app.use(express.static(path.join(__dirname, "../client/build")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build/index.html"));
});

app.listen(port, () => {
  console.log(`Serwer działa na porcie ${port}`);
});
