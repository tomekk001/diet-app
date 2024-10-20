import React from "react";
import { Link } from "react-router-dom";
import "../styles/Home.css";

const Home = () => {
  return (
    <div>
      <header>
        <h1>Welcome to the Diet app</h1>
        <p>This is the home page</p>
      </header>
      <Link to="/login">
        <button>Zaloguj się</button>
      </Link>
      <Link to="/register">
        <button>Zarejestruj się</button>
      </Link>
    </div>
  );
};
export default Home;
