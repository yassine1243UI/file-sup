import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

// Chargez votre clé publique Stripe ici (pk_test_xxx)
const stripePromise = loadStripe("pk_test_51PvlpgL0QB8STWZL826TQYSeoaCh6l2DTmonnRlyuHGNPexeyPSorzp12ggscBdzqvV0nrTHPGKQnmIEbgMGDrqA00oMukw4YW");

const PaymentForm = ({ clientSecret }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return alert("Stripe n'est pas encore chargé !");
    }

    const card = elements.getElement(CardElement);

    // Confirmation du paiement avec Stripe
    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: card,
        billing_details: { name: "John Doe" }, // Nom de l'utilisateur (ajustez si nécessaire)
      },
    });

    if (result.error) {
      console.error(result.error.message);
      alert("Échec du paiement !");
    } else if (result.paymentIntent.status === "succeeded") {
      // Mise à jour du backend pour valider le paiement
      const response = await fetch("http://localhost:5000/api/auth/payment-success", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ paymentIntentId: result.paymentIntent.id }),
      });

      if (response.ok) {
        alert("Paiement validé et compte activé !");
        navigate("/login"); // Redirection après succès
      } else {
        console.error("Erreur lors de la validation du paiement sur le backend.");
        alert("Paiement validé, mais une erreur est survenue côté serveur.");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1>Effectuer un paiement</h1>
      <CardElement />
      <button type="submit" disabled={!stripe}>
        Payer
      </button>
    </form>
  );
};

const Payment = () => {
  const location = useLocation();
  const clientSecret = location.state?.clientSecret; // Récupère le clientSecret passé depuis l'inscription

  if (!clientSecret) {
    return <p>Aucun paiement en attente.</p>;
  }

  return (
    <Elements stripe={stripePromise}>
      <PaymentForm clientSecret={clientSecret} />
    </Elements>
  );
};

export default Payment;
