import React from "react";
import { useNavigate } from "react-router-dom";
import "./Header.css"; // Lien vers le fichier CSS du header

const Header = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Supprimer le token d'authentification
    localStorage.removeItem("token");
    
    // Rediriger vers la page de connexion
    navigate("/login");
  };

  return (
    <header className="header">
      <h1 className="header-title">Tableau de bord</h1>
      <button className="logout-button" onClick={handleLogout}>Logout</button>
    </header>
  );
};

export default Header;
