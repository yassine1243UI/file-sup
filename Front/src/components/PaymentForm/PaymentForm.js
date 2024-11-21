import React, { useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

function PaymentForm({ clientSecret, onPaymentSuccess, onPaymentError }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      onPaymentError("Stripe n'est pas chargé. Veuillez réessayer.");
      return;
    }

    const cardElement = elements.getElement(CardElement);

    setLoading(true);
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card: cardElement,
    });

    if (error) {
      setLoading(false);
      onPaymentError("Erreur de paiement : " + error.message);
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/payments/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentMethodId: paymentMethod.id,
          clientSecret,
        }),
      });

      const data = await response.json();
      setLoading(false);

      if (response.ok) {
        onPaymentSuccess(data.message);
      } else {
        onPaymentError(data.message || "Erreur lors de la confirmation du paiement.");
      }
    } catch (error) {
      setLoading(false);
      onPaymentError("Erreur réseau : " + error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="payment-form">
      <div className="mb-4">
        <label className="block text-sm font-bold mb-2 text-gray-700">Informations de carte</label>
        <div className="border rounded-lg p-3 shadow-sm">
          <CardElement />
        </div>
      </div>
      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition"
        disabled={!stripe || loading}
      >
        {loading ? "Traitement..." : "Payer"}
      </button>
    </form>
  );
}

export default PaymentForm;
