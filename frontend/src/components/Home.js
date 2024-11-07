import React from "react";
import { Link } from "react-router-dom";
import "../styles/Home.css";

const Home = () => {
  return (
    <div>
      <header>
        <h1>Genrator diety</h1>
        <p>Strona główna</p>
      </header>
      <div className="btnHome">
        <Link to="/login">
          <button>Zaloguj się</button>
        </Link>
        <Link to="/register">
          <button>Zarejestruj się</button>
        </Link>
      </div>
    </div>
  );
};
export default Home;
