import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost:5000/api/login", {
        email,
        password,
      });

      // Przechowywanie tokenu w localStorage
      localStorage.setItem("token", response.data.token);

      // Przekierowanie do Dashboard po zalogowaniu
      navigate("/dashboard");
    } catch (error) {
      console.error("Blad podczas logowania:", error);
      setMessage("Błąd logowania");
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <div className="container">
        <form className="formFirst" onSubmit={handleSubmit}>
          <input
            className="loginInput"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
          />
          <input
            className="loginInput"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
          <button type="submit">Login</button>
        </form>
        {message && <p>{message}</p>}
      </div>
    </div>
  );
};

export default Login;
