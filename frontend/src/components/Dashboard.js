// src/components/Dashboard.js
import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";
import { FaCalculator, FaClipboardList, FaCalendarAlt } from "react-icons/fa";

const Dashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token"); // Usuń token z localStorage
    navigate("/login"); // Przekieruj na stronę logowania
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Witamy w panelu generatora diety</h1>
        <button className="logout-button" onClick={handleLogout}>
          Wyloguj się
        </button>
      </div>
      <p className="dashboard-description">
        Zarządzaj swoją dietą, śledź posiłki i bądź na bieżąco ze swoimi celami
        żywieniowymi.
      </p>
      <div className="dashboard-grid">
        <div className="dashboard-card" onClick={() => navigate("/calculator")}>
          <FaCalculator className="card-icon" />
          <h2 className="card-title">Kreator Diety</h2>
          <p className="card-description">
            Stwórz spersonalizowany plan diety dostosowany do Twoich potrzeb
            kalorycznych i makroskładników.
          </p>
        </div>
        <div
          className="dashboard-card"
          onClick={() => navigate("/stored-diets")}
        >
          <FaClipboardList className="card-icon" />
          <h2 className="card-title">Przechowywane Diety</h2>
          <p className="card-description">
            Przeglądaj zapisane plany dietetyczne, dostosuj je do swoich potrzeb
            lub zaktualizuj.
          </p>
        </div>
        <div className="dashboard-card" onClick={() => navigate("/calendar")}>
          <FaCalendarAlt className="card-icon" />
          <h2 className="card-title">Kalendarz</h2>
          <p className="card-description">
            Śledź swoje plany żywieniowe na przestrzeni dni. Zaplanuj posiłki i
            monitoruj postępy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
