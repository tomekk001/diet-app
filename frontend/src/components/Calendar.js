import React from "react";
import { useNavigate } from "react-router-dom";

const Calendar = () => {
  const navigate = useNavigate();
  return (
    <div>
      <h2>Kalendarz Diety</h2>
      {/* Logika kalendarza */}
      <button onClick={() => navigate("/dashboard")}>
        Powrót do Dashboard
      </button>
    </div>
  );
};

export default Calendar;
