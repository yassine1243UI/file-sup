import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Input from "../../components/Input/Input";
import Button from "../../components/Button/Button";
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });
      localStorage.setItem("token", response.data.token);
      alert("Connexion réussie !");
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      alert("Erreur de connexion. Vérifiez vos identifiants.");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <h1>📂 FileSup</h1>
          <p>Connectez-vous à votre compte</p>
        </div>
        <form onSubmit={handleSubmit} className="login-form space-y-4">
          <Input
            name="email"
            label="Email"
            type="email"
            placeholder="Entrez votre email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            name="password"
            label="Mot de passe"
            type="password"
            placeholder="Entrez votre mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <div className="button-container">
            <Button type="submit">Se connecter</Button>
          </div>
        </form>
        <div className="signup-link">
          <p>
            Pas encore de compte ?{" "}
            <button onClick={() => navigate("/signup")}>S'inscrire</button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
