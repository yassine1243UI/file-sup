import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Signup from "./components/Signup";
import Login from "./components/Login";
import Payment from "./components/Payment";
import Dashboard from './Pages/Dashboard'; // La page du tableau de bord



const App = () => {
  return (
    <Router>
      <Routes>
        {/* Route pour la connexion */}
        <Route path="/login" element={<Login />} />

        {/* Route pour l'inscription */}
        <Route path="/signup" element={<Signup />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/dashboard" element={<Dashboard />} />  {/* Définit la route du dashboard */}
      
        {/* Redirection par défaut vers /login */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default App;
