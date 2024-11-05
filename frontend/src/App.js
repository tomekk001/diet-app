// src/App.js
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
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/home" />} />
        <Route path="/home" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* Trasy chronione przez ProtectedRoute */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/calculator"
          element={
            <ProtectedRoute>
              <CalculatorDiet />
            </ProtectedRoute>
          }
        />
        <Route
          path="/stored-diets"
          element={
            <ProtectedRoute>
              <StoredDiets />
            </ProtectedRoute>
          }
        />
        <Route
          path="/calendar"
          element={
            <ProtectedRoute>
              <Calendar />
            </ProtectedRoute>
          }
        />
        <Route
          path="/test"
          element={
            <ProtectedRoute>
              <Test />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
