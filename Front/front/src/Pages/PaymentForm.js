import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { TextField, Button, Grid, MenuItem, Typography, Container, Paper } from '@mui/material';

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
    const [plan, setPlan] = useState('base');

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
            // Process payment and signup
        }
    };

    return (
        <Container maxWidth="md">
            <Paper elevation={3} style={{ padding: '20px', marginTop: '20px' }}>
                <Typography variant="h4" gutterBottom>
                    Checkout Form
                </Typography>
                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Full Name"
                                fullWidth
                                value={name}
                                onChange={e => setName(e.target.value)}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Email"
                                type="email"
                                fullWidth
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Password"
                                type="password"
                                fullWidth
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Phone"
                                fullWidth
                                value={phone}
                                onChange={e => setPhone(e.target.value)}
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Billing Address"
                                fullWidth
                                value={billingAddress}
                                onChange={e => setBillingAddress(e.target.value)}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField
                                label="City"
                                fullWidth
                                value={billingAddressCity}
                                onChange={e => setBillingAddressCity(e.target.value)}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField
                                label="State"
                                fullWidth
                                value={billingAddressState}
                                onChange={e => setBillingAddressState(e.target.value)}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField
                                label="Postal Code"
                                fullWidth
                                value={billingAddressPostalCode}
                                onChange={e => setBillingAddressPostalCodes(e.target.value)}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Country"
                                fullWidth
                                value={billingAddressCountry}
                                onChange={e => setBillingAddressCountry(e.target.value)}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                select
                                label="Plan"
                                fullWidth
                                value={plan}
                                onChange={e => setPlan(e.target.value)}
                                required
                            >
                                <MenuItem value="base">Base - 20€</MenuItem>
                                <MenuItem value="premium">Premium - 50€</MenuItem>
                                <MenuItem value="pro">Pro - 100€</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid item xs={12}>
                            <div style={{ border: '1px solid #ccc', padding: '10px', borderRadius: '5px' }}>
                                <CardElement />
                            </div>
                        </Grid>
                    </Grid>
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                        style={{ marginTop: '20px' }}
                        disabled={!stripe}
                    >
                        Sign Up and Pay
                    </Button>
                </form>
            </Paper>
        </Container>
    );
}

export default PaymentForm;
