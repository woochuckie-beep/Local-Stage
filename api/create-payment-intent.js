// ─────────────────────────────────────────────────────────────
//  LocalStage — Stripe PaymentIntent endpoint
//  Deploy this file to: api/create-payment-intent.js
//  (i.e. place it at the root of your Vercel project under /api/)
//
//  SETUP:
//  1. Run: npm install stripe
//  2. In Vercel dashboard → your project → Settings → Environment Variables
//     Add: STRIPE_SECRET_KEY = sk_test_... (your secret key)
//  3. Deploy — Vercel auto-serves files in /api/ as serverless functions
// ─────────────────────────────────────────────────────────────

const Stripe = require('stripe');

module.exports = async (req, res) => {
  // ── CORS headers (allow your frontend domain) ──────────────
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // ── Init Stripe with secret key from environment variable ──
  // NEVER hardcode the secret key here — use the env variable
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    const {
      amount   = 9900,   // cents — $99.00 CAD
      currency = 'cad',
      email
    } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      receipt_email: email || undefined,
      automatic_payment_methods: { enabled: true },
      metadata: {
        source:    'LocalStage',
        booked_by: email || 'unknown'
      }
    });

    res.status(200).json({ clientSecret: paymentIntent.client_secret });

  } catch (err) {
    console.error('Stripe error:', err.message);
    res.status(500).json({ error: err.message });
  }
};
