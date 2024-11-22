import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Pages/Login/Login";
import Signup from "./Pages/Signup/Signup";
import Payment from "./Pages/Payment/Payment"
import Homepage from "./Pages/HomePage/Homepage";
import Footer from "./components/Footer/Footer";
import Dashboard from "./Pages/Dashboard/Dashboard"
import Profile from "./Pages/Profil/Profile";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Homepage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile/>}/>
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
      <Footer/>
    </Router>
  );
};

export default App;
