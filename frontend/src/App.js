import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Register from "./components/Register";
import Login from "./components/Login";
import CalculatorDiet from "./components/CalculatorDiet";
import StoredDiets from "./components/StoredDiets";
import Calendar from "./components/Calendar";
import Dashboard from "./components/Dashboard";
import Home from "./components/Home";
import Test from "./components/Test";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/home" />} />
        <Route path="/home" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/calculator" element={<CalculatorDiet />} />
        <Route path="/stored-diets" element={<StoredDiets />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/test" element={<Test />} />
      </Routes>
    </Router>
  );
}

export default App;
