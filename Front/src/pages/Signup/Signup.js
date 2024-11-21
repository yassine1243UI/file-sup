import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Input from "../../components/Input/Input";
import Button from "../../components/Button/Button";
import "./Signup.css";

const Signup = () => {
  const [currentStep, setCurrentStep] = useState(1);
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
  const [error, setError] = useState("");

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

  const handleNextStep = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      handleSubmit();
    }
  };

  const handlePreviousStep = () => {
    setCurrentStep((prevStep) => prevStep - 1);
  };

  const validateStep1 = () => {
    const { name, email, password, phone } = formData;
    if (!name || !email || !password || !phone) {
      setError("Tous les champs doivent être remplis.");
      return false;
    }
    setError("");
    return true;
  };

  const validateStep2 = () => {
    const { street, city, zip } = formData.billing_address;
    if (!street || !city || !zip) {
      setError("Tous les champs d'adresse doivent être remplis.");
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/signup",
        formData
      );
      const clientSecret = response.data.clientSecret;
      alert("Inscription réussie ! Procédez au paiement.");
      navigate("/payment", { 
        state: { 
          clientSecret, 
          userInfo: { 
            name: formData.name, 
            email: formData.email, 
            password: formData.password 
          }
        } 
      });
    } catch (error) {
      console.error(error);
      setError("Erreur lors de l'inscription. Veuillez réessayer.");
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="main-content grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              name="name"
              label="Nom"
              value={formData.name}
              onChange={handleChange}
              placeholder="Entrez votre nom"
            />
            <Input
              name="email"
              label="Email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Entrez votre adresse email"
            />
            <Input
              name="password"
              label="Mot de passe"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Entrez un mot de passe"
            />
            <Input
              name="phone"
              label="Téléphone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Entrez votre numéro de téléphone"
            />
          </div>
        );
      case 2:
        return (
          <div className="main-content grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              name="street"
              label="Adresse"
              value={formData.billing_address.street}
              onChange={handleChange}
              placeholder="Entrez votre rue"
            />
            <Input
              name="city"
              label="Ville"
              value={formData.billing_address.city}
              onChange={handleChange}
              placeholder="Entrez votre ville"
            />
            <Input
              name="zip"
              label="Code postal"
              value={formData.billing_address.zip}
              onChange={handleChange}
              placeholder="Entrez votre code postal"
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="signup flex items-center justify-center min-h-screen bg-gradient-to-r from-indigo-500 to-blue-500">
      <div className="card rounded-xl shadow-lg bg-white p-6 w-full max-w-lg">
        <div className="top text-center mb-4">
          <h1 className="text-3xl font-bold text-indigo-600 mb-2">
            📂 FileSup
          </h1>
        </div>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        {renderStepContent()}

        <div className="bottom flex justify-between items-center mt-4">
          {currentStep > 1 && (
            <Button onClick={handlePreviousStep} css="py-2 px-4 text-sm w-auto">
              Retour
            </Button>
          )}
          <Button onClick={handleNextStep} css="py-2 px-4 text-sm w-auto">
            {currentStep === 2 ? "S'inscrire" : "Suivant"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Signup;
