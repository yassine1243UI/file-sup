import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

function PaymentForm() {
    const stripe = useStripe();
    const elements = useElements();
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [billingAddress, setBillingAddress] = useState('');
    const [billingAddressCity, setBillingAddressCity] = useState('');
    const [billingAddressState, setBillingAddressState] = useState('');
    const [billingAddressPostalCode, setBillingAddressPostalCodes] = useState('');
    const [billingAddressCountry, setBillingAddressCountry] = useState('');
    const [plan, setPlan] = useState('base'); // Default plan


    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        const cardElement = elements.getElement(CardElement);
        const { error, paymentMethod } = await stripe.createPaymentMethod({
            type: 'card',
            card: cardElement,
        });

        if (error) {
            console.log('[error]', error);
            alert('Payment failed: ' + error.message);
        } else {
            console.log('[PaymentMethod]', paymentMethod);
            // Now send paymentMethod.id along with user data to your backend
            fetch('http://localhost:5000/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    email,
                    password,
                    phone,
                    billingAddress: {
                        address: billingAddress,
                        city: billingAddressCity,
                        state: billingAddressState,
                        postalCode: billingAddressPostalCode,
                        country: billingAddressCountry
                    },
                    plan,
                    paymentMethodId: paymentMethod.id
                })
            })
            .then(response => response.json())
            .then(data => {
                alert('Signup successful: ' + data.message);
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error in signup/payment process');
            });
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Name" required />
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required />
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required />
            <input type="text" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone" required />
            <textarea value={billingAddress} onChange={e => setBillingAddress(e.target.value)} placeholder="Billing Address" required />
            <textarea value={billingAddressCity} onChange={e => setBillingAddressCity(e.target.value)} placeholder="Billing City" required />
            <textarea value={billingAddressPostalCode} onChange={e => setBillingAddressPostalCodes(e.target.value)} placeholder="Billing Postal Codes" required />
            <textarea value={billingAddressState} onChange={e => setBillingAddressState(e.target.value)} placeholder="Billing State" required />
            <textarea value={billingAddressCountry} onChange={e => setBillingAddressCountry(e.target.value)} placeholder="Billing Country" required />
            <select value={plan} onChange={e => setPlan(e.target.value)}>
                <option value="base">Base - 20€</option>
                <option value="premium">Premium - 50€</option>
                <option value="pro">Pro - 100€</option>
            </select>
            <CardElement />
            <button type="submit" disabled={!stripe}>Sign Up and Pay</button>
        </form>
    );
}

export default PaymentForm;
