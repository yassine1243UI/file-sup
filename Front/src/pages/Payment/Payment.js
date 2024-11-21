import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

// Chargez votre clé publique Stripe ici (pk_test_xxx)
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
        return alert("Stripe n'est pas encore chargé !");
      }
  
      const card = elements.getElement(CardElement);
  
      try {
        setLoading(true); // Indicateur de chargement
        const result = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: card,
            billing_details: {
              name: userInfo.name, // Utilisation du nom de l'utilisateur ici
              email: userInfo.email, // Si nécessaire, tu peux aussi ajouter l'email
            },
          },
        });
  
        if (result.error) {
          setError(result.error.message);
          console.error("Erreur lors du paiement : ", result.error.message);
        } else if (result.paymentIntent.status === "succeeded") {
          // Paiement réussi
          const response = await fetch("http://localhost:5000/api/auth/payment-success", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
                paymentIntentId: result.paymentIntent.id,
                password: userInfo.password // Envoie le mot de passe ici
              }),
          });
  
          if (response.ok) {
            alert("Paiement validé et compte activé !");
            navigate("/login");
          } else {
            console.error("Erreur côté serveur");
            alert("Erreur serveur lors de la validation du paiement.");
          }
        }
      } catch (err) {
        console.error("Erreur du processus de paiement :", err);
        setError("Une erreur est survenue lors du traitement du paiement.");
      } finally {
        setLoading(false); // Fin du chargement
      }
    };
  
    return (
      <form onSubmit={handleSubmit}>
        <h1>Effectuer un paiement</h1>
        {error && <div style={{ color: 'red' }}>{error}</div>}
        <CardElement />
        <button type="submit" disabled={!stripe || loading}>
          {loading ? "Chargement..." : "Payer"}
        </button>
      </form>
    );
  };
  
  const Payment = () => {
    const location = useLocation();
    const clientSecret = location.state?.clientSecret;
    const userInfo = location.state?.userInfo; // Récupère les infos utilisateur ici
  
    if (!clientSecret || !userInfo) {
      return <p>Aucun paiement en attente.</p>;
    }
  
    return (
      <Elements stripe={stripePromise}>
        <PaymentForm clientSecret={clientSecret} userInfo={userInfo} />
      </Elements>
    );
  };
  
  export default Payment;
  
