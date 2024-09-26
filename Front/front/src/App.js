import React from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import PaymentForm from './Pages/PaymentForm';

// Load the Stripe script
const stripePromise = loadStripe('pk_test_51PvlpgL0QB8STWZLEvVaSObOdudM0AC3vCYYg05Ifgn1yD8E6XJhBs6HRZG9sdiyqdfw8l3ST3Ib8JHbt62m7kRv00zN8JrURE');

function App() {
  return (
    <div className="App">
      <Elements stripe={stripePromise}>
        <PaymentForm />
      </Elements>
    </div>
  );
}

export default App;
