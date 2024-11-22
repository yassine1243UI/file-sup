import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import PaymentForm from "../../components/PaymentForm/PaymentForm";
import "./UpgradePayment.css";

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

const UpgradePayment = () => {
  const pricePerGigabyte = 1; 
  const maxGigabytes = 20; 
  const [clientSecret, setClientSecret] = useState(null);
  const [gigabytes, setGigabytes] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const calculateAmount = () => gigabytes * pricePerGigabyte * 100;

  useEffect(() => {
    const fetchClientSecret = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/payment/intent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ amount: calculateAmount() }),
        });

        if (!response.ok) {
          throw new Error("Erreur lors de la création du paiement.");
        }

        const data = await response.json();
        setClientSecret(data.clientSecret);
      } catch (error) {
        console.error("Erreur lors de la récupération du clientSecret:", error);
        setError("Impossible de se connecter au service de paiement.");
      } finally {
        setLoading(false);
      }
    };

    fetchClientSecret();
  }, [gigabytes]);

  const handlePaymentSuccess = (message) => {
    alert(`Paiement réussi : ${message}`);
  };

  const handlePaymentError = (errorMessage) => {
    alert(`Erreur de paiement : ${errorMessage}`);
  };

  if (loading) {
    return <div className="loading">Chargement en cours...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="upgrade-page">
      <h1>Augmentez votre stockage</h1>
      <p>Sélectionnez le nombre de gigas à ajouter :</p>

      <div className="storage-options">
        <input
          type="number"
          value={gigabytes}
          min="1"
          max={maxGigabytes}
          onChange={(e) =>
            setGigabytes(Math.max(1, Math.min(maxGigabytes, parseInt(e.target.value) || 1)))
          }
        />
        <p>
          Prix total : <strong>{gigabytes * pricePerGigabyte} €</strong>
        </p>
      </div>

      {clientSecret && (
        <Elements stripe={stripePromise}>
          <PaymentForm
            clientSecret={clientSecret}
            onPaymentSuccess={handlePaymentSuccess}
            onPaymentError={handlePaymentError}
          />
        </Elements>
      )}
    </div>
  );
};

export default UpgradePayment;
