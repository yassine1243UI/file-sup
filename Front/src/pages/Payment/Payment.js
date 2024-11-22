import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import Button from "../../components/Button/Button";

const stripePromise = loadStripe("pk_test_51PvlpgL0QB8STWZLk81AQ7kFUrdQbGKoQZdPkE3i8oMO4bkcdSrFCQMCZ0pP0iGQ0puYrqXodDj67tl8xyspZiov00ROwen1YD");

const PaymentForm = ({ clientSecret, userInfo }) => {
  const stripe = useStripe();
  const elements = useElements();
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
        alert("Paiement validé et compte activé !");
      }
    } catch (err) {
      setError("Une erreur est survenue lors du traitement du paiement.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1>Effectuer un paiement</h1>
      {error && <div className="error">{error}</div>}
      <CardElement />
      <Button type="submit" disabled={!stripe || loading}>
        {loading ? "Chargement..." : "Payer"}
      </Button>
    </form>
  );
};

const Payment = () => {
  const location = useLocation();
  const { clientSecret, userInfo } = location.state || {};

  if (!clientSecret || !userInfo) {
    return (
      <div>
        <h1>Erreur de paiement</h1>
        <p>Aucune demande de paiement en cours. Veuillez réessayer plus tard.</p>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <PaymentForm clientSecret={clientSecret} userInfo={userInfo} />
    </Elements>
  );
};

export default Payment;
