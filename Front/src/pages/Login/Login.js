import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/api/auth/login", { email, password });
      localStorage.setItem("token", response.data.token);
      alert("Connexion réussie !");
      // Redirige l'utilisateur connecté vers une page d'accueil ou tableau de bord
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      alert("Erreur de connexion. Vérifiez vos identifiants.");
    }
  };

  return (
    <div>
      <h1>Connexion</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Se connecter</button>
      </form>
      <p>
        Pas encore de compte ?{" "}
        <button onClick={() => navigate("/signup")}>S'inscrire</button>
      </p>
    </div>
  );
};

export default Login;
