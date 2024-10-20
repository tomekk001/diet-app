import React from "react";
import "../styles/Calendar.css";
import BackButton from "./BackButton";

const Calendar = () => {
  return (
    <div>
      <BackButton className="back-button-calendar" /> <h2>Kalendarz Diety</h2>
    </div>
  );
};

export default Calendar;
