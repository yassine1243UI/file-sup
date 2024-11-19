import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    billing_address: {
      street: "",
      city: "",
      zip: "",
    },
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name in formData.billing_address) {
      setFormData({
        ...formData,
        billing_address: { ...formData.billing_address, [name]: value },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/api/auth/signup", formData);
      const clientSecret = response.data.clientSecret;
      alert("Inscription réussie ! Procédez au paiement.");
      navigate("/payment", { state: { clientSecret } });
    //   navigate("/payment", { state: { clientSecret: response.clientSecret } });

    } catch (error) {
      console.error(error);
      alert("Erreur lors de l'inscription.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1>Inscription</h1>
      <input type="text" name="name" placeholder="Nom" onChange={handleChange} required />
      <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
      <input type="password" name="password" placeholder="Mot de passe" onChange={handleChange} required />
      <input type="text" name="phone" placeholder="Téléphone" onChange={handleChange} required />
      <input type="text" name="street" placeholder="Adresse" onChange={handleChange} required />
      <input type="text" name="city" placeholder="Ville" onChange={handleChange} required />
      <input type="text" name="zip" placeholder="Code postal" onChange={handleChange} required />
      <button type="submit">S'inscrire</button>
    </form>
  );
};

export default Signup;
