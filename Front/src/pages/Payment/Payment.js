import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import Button from "../../components/Button/Button";
import "./Payment.css";

const stripePromise = loadStripe("pk_test_51PvlpgL0QB8STWZLk81AQ7kFUrdQbGKoQZdPkE3i8oMO4bkcdSrFCQMCZ0pP0iGQ0puYrqXodDj67tl8xyspZiov00ROwen1YD");

const PaymentForm = ({ clientSecret, userInfo }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      alert("Stripe n'est pas encore chargé !");
      return;
    }

    const card = elements.getElement(CardElement);

    try {
      setLoading(true);
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: card,
          billing_details: {
            name: userInfo.name,
            email: userInfo.email,
          },
        },
      });

      if (result.error) {
        setError(result.error.message);
      } else if (result.paymentIntent.status === "succeeded") {
        const response = await fetch("http://localhost:5000/api/auth/payment-success", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentIntentId: result.paymentIntent.id, password: userInfo.password }),
        });

        if (response.ok) {
          alert("Paiement validé et compte activé !");
          navigate("/login");
        } else {
          alert("Erreur serveur lors de la validation du paiement.");
        }
      }
    } catch (err) {
      setError("Une erreur est survenue lors du traitement du paiement.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="payment-form">
      <h1 className="payment-title">Effectuer un paiement</h1>
      {error && <div className="payment-error">{error}</div>}
      <div className="card-input">
        <CardElement />
      </div>
      <Button type="submit" css="payment-button" disabled={!stripe || loading}>
        {loading ? "Chargement..." : "Payer"}
      </Button>
    </form>
  );
};

const Payment = () => {
  const location = useLocation();
  const clientSecret = location.state?.clientSecret;
  const userInfo = location.state?.userInfo;

  if (!clientSecret || !userInfo) {
    return (
      <div className="payment-page">
        <div className="payment-card">
          <h1 className="no-payment-title">Erreur</h1>
          <p className="no-payment-message">Aucun paiement en attente. Veuillez vérifier vos informations ou réessayer plus tard.</p>
          <Button
            css="payment-back-button"
            onClick={() => {
              window.history.back(); // Retour à la page précédente
            }}
          >
            Retour
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-page">
      <div className="payment-card">
        <Elements stripe={stripePromise}>
          <PaymentForm clientSecret={clientSecret} userInfo={userInfo} />
        </Elements>
      </div>
    </div>
  );
};

export default Payment;
