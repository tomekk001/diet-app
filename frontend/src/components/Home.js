import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div>
      <h1>Welcome to the Diet app</h1>
      <p>This is the home page</p>
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
