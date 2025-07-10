const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Payment = require('../models/paymentModel');

router.post('/', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.log('Webhook signature verification failed.', err.message);
    return res.sendStatus(400);
  }

  if (event.type === 'payment_intent.succeeded') {
    const intent = event.data.object;
    console.log(`PaymentIntent succeeded: ${intent.id}`);

    try {
      await Payment.findOneAndUpdate(
        { paymentIntentId: intent.id },
        { status: 'completed' }
      );
    } catch (error) {
      console.error('Failed to update payment:', error.message);
    }
  }

  res.status(200).json({ received: true });
});

module.exports = router;
