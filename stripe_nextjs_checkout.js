// =============================================================
// Stripe Checkout – Illustrated UI (Next.js 14 · Pages Router)
// =============================================================
// Folder layout
// ├── .env.example
// ├── package.json
// ├── pages/
// │   ├── index.js               → Two‑column checkout UI (this is the screenshot‑style form)
// │   ├── success.js             → Thank‑you page
// │   ├── cancel.js              → Payment‑cancel page
// │   └── api/
// │       └── create-checkout-session.js  → Calls Stripe SDK
// └── styles/
//     └── globals.css            → Tailwind base + a few custom tweaks
//
// 📦  Quick start
// -------------------------------------------------------------
// 1. `npm install`
// 2. copy .env.example → .env.local and fill in keys
// 3. `npm run dev` (local) / `npm run build && npm start` (prod)
//
// -----------------------------------------------------------------------------
// package.json
// -----------------------------------------------------------------------------
{
  "name": "stripe-nextjs-checkout",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "@stripe/stripe-js": "^2.4.0",
    "next": "14.1.3",
    "react": "18.3.1",
    "react-dom": "18.3.1",
    "stripe": "^15.10.0"
  }
}

// -----------------------------------------------------------------------------
// .env.example  (copy → .env.local)
// -----------------------------------------------------------------------------
STRIPE_SECRET_KEY=sk_live_XXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_XXXXXXXXXXXXXXXXXXXXXXXX
# Price ID that represents your €319,90 product (one‑time)
STRIPE_PRICE_ID=price_XXXXXXXXXXXXXXXXXXXXXXXX

// -----------------------------------------------------------------------------
// styles/globals.css  (Tailwind – keep minimal)
// -----------------------------------------------------------------------------
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Scrollbar + form tweaks */
* {
  @apply scroll-smooth;
}

input, select {
  @apply rounded-md border border-gray-300 focus:ring-2 focus:ring-black/80 focus:border-black outline-none;
}

// -----------------------------------------------------------------------------
// pages/api/create-checkout-session.js
// -----------------------------------------------------------------------------
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.setHeader('Allow', 'POST').status(405).end('Method Not Allowed');
  }

  try {
    const {
      email,
      phone,
      firstName,
      lastName,
      addressLine,
      city,
      postalCode,
      country,
    } = JSON.parse(req.body);

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card', 'paypal', 'paypal_pay_later', 'google_pay', 'afterpay_clearpay'],
      customer_creation: 'if_required',
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'NL', 'DE', 'FR', 'AU', 'NZ', 'IE', 'BE', 'AT', 'DK', 'SE', 'NO', 'FI', 'IT', 'ES', 'PT', 'LU', 'CZ', 'PL'],
      },
      customer_email: email,
      phone_number_collection: { enabled: true },
      shipping_options: [{ shipping_rate: 'shr_standard' }], // optional: create in dashboard
      metadata: {
        firstName,
        lastName,
      },
      success_url: `${req.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/cancel`,
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}

// -----------------------------------------------------------------------------
// pages/index.js – full‑width UI mimicking the screenshot
// -----------------------------------------------------------------------------
import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

const PRODUCT = {
  name: 'Scalp Rebalancing Kit',
  subtitle: '3 Months',
  priceEUR: 319.9,
  image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=200&q=80', // placeholder
};

export default function Checkout() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: '',
    phone: '',
    firstName: '',
    lastName: '',
    addressLine: '',
    city: '',
    postalCode: '',
    country: 'NL',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const { url } = await res.json();
      const stripe = await stripePromise;
      stripe.redirectToCheckout({ url });
    } catch (err) {
      console.error(err);
      alert(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#E9E4DD]">
      {/* Header */}
      <header className="bg-[#C9C1B7] py-4 px-6 flex items-center justify-between">
        <h1 className="text-2xl font-black tracking-wide">SASSY SCALP</h1>
        <span className="text-2xl">🛒</span>
      </header>

      <main className="mx-auto max-w-6xl px-4 md:px-8 py-8 grid md:grid-cols-3 gap-10">
        {/* Left – Form */}
        <section className="md:col-span-2 space-y-8">
          {/* Quick pay */}
          <div className="space-y-4">
            <h2 className="sr-only">Snelle checkout</h2>
            <div className="flex items-center gap-4 [&>button]:flex-1">
              <button className="bg-[#5A31F4] text-white py-3 rounded-md font-semibold shadow">shop&nbsp;Pay</button>
              <button className="bg-[#F6C439] text-black py-3 rounded-md font-semibold shadow">PayPal</button>
              <button className="bg-black text-white py-3 rounded-md font-semibold shadow">G&nbsp;Pay</button>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-px bg-gray-300" />
              <span className="text-sm text-gray-500">OF</span>
              <div className="flex-1 h-px bg-gray-300" />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Contact */}
            <div>
              <h3 className="font-semibold mb-3">Contact</h3>
              <input name="email" type="email" placeholder="E‑mail of mobiele telefoonnummer" value={form.email} onChange={handleChange} required className="w-full p-3" />
            </div>

            {/* Shipping */}
            <div className="space-y-4">
              <h3 className="font-semibold">Bezorging</h3>
              <select name="country" value={form.country} onChange={handleChange} className="w-full p-3">
                <option value="NL">Nederland</option>
                <option value="BE">België</option>
                <option value="DE">Duitsland</option>
                {/* add more */}
              </select>

              <div className="grid sm:grid-cols-2 gap-4">
                <input name="firstName" placeholder="Voornaam (optioneel)" value={form.firstName} onChange={handleChange} className="p-3" />
                <input name="lastName" placeholder="Achternaam" value={form.lastName} onChange={handleChange} className="p-3" required />
              </div>
              <div className="relative">
                <input name="addressLine" placeholder="Adres" value={form.addressLine} onChange={handleChange} required className="w-full p-3" />
                <span className="absolute right-3 top-3 text-gray-400">🔍</span>
              </div>
              <input name="city" placeholder="Stad" value={form.city} onChange={handleChange} required className="p-3 w-full" />
              <div className="grid grid-cols-2 gap-4">
                <input name="postalCode" placeholder="Postcode" value={form.postalCode} onChange={handleChange} required className="p-3" />
                <input name="phone" placeholder="Telefoon" value={form.phone} onChange={handleChange} className="p-3" />
              </div>
            </div>

            {/* Payment */}
            <div className="space-y-4">
              <h3 className="font-semibold">Betaling</h3>
              <p className="text-sm text-gray-500 mb-2">Alle transacties zijn beveiligd en versleuteld.</p>
              {/* We don’t collect card details here because Stripe Checkout redirects; mean UI only */}
              <div className="space-y-2 border rounded-md p-4 bg-white/80">
                <label className="flex items-center gap-2">
                  <input type="radio" name="pm" defaultChecked className="accent-black" />
                  <span className="flex-1">Creditcard</span>
                  <span className="flex gap-1 text-xl">💳 🧾</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" name="pm" className="accent-black" />
                  <span className="flex-1">PayPal</span>
                  <span className="text-xl">🅿️</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" name="pm" className="accent-black" />
                  <span className="flex-1">shop&nbsp;Pay</span>
                  <span className="text-xl">🛍️</span>
                </label>
              </div>
            </div>

            {/* Billing (collapsed) */}
            <div>
              <h3 className="font-semibold mb-3">Factuuradres</h3>
              <label className="flex items-center gap-2 mb-2">
                <input type="radio" defaultChecked className="accent-black" />
                <span>Zelfde als bezorgadres</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" className="accent-black" />
                <span>Een ander factuuradres gebruiken</span>
              </label>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-black text-white py-4 rounded-md text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? 'Bezig...' : 'Ga naar betalen'}
            </button>
          </form>
        </section>

        {/* Right – Order summary */}
        <aside className="bg-white/60 rounded-xl p-6 space-y-6 h-max">
          <div className="flex items-start gap-4">
            <img src={PRODUCT.image} alt="Product" className="w-16 h-20 object-cover rounded-md" />
            <div className="flex-1">
              <h4 className="font-medium leading-tight">{PRODUCT.name}</h4>
              <p className="text-sm text-gray-500">{PRODUCT.subtitle}</p>
            </div>
            <span className="font-medium">€ {PRODUCT.priceEUR.toFixed(2)}</span>
          </div>

          <div className="flex gap-2">
            <input placeholder="Kortingscode" className="flex-1 p-3" />
            <button className="bg-gray-200 px-4 rounded-md">Toepassen</button>
          </div>

          <div className="text-sm space-y-2">
            <div className="flex justify-between"><span>Subtotaal</span><span>€ {PRODUCT.priceEUR.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Verzending</span><span className="text-gray-500">Bezorgadres invoeren</span></div>
          </div>
          <div className="flex justify-between font-semibold text-lg border-t pt-4">
            <span>Totaal</span>
            <span>EUR € {PRODUCT.priceEUR.toFixed(2)}</span>
          </div>
        </aside>
      </main>
    </div>
  );
}

// -----------------------------------------------------------------------------
// pages/success.js
// -----------------------------------------------------------------------------
export default function Success() {
  return (
    <div className="h-screen flex flex-col items-center justify-center text-center bg-[#E9E4DD]">
      <h1 className="text-3xl font-bold mb-4">Bedankt voor je bestelling! 🥳</h1>
      <p>Je betaling is voltooid en we gaan meteen aan de slag met je order.</p>
      <a href="/" className="mt-6 underline">Terug naar home</a>
    </div>
  );
}

// -----------------------------------------------------------------------------
// pages/cancel.js
// -----------------------------------------------------------------------------
export default function Cancel() {
  return (
    <div className="h-screen flex flex-col items-center justify-center text-center bg-[#E9E4DD]">
      <h1 className="text-3xl font-bold mb-4">Betaling geannuleerd</h1>
      <p>Geen zorgen – je kunt het altijd opnieuw proberen.</p>
      <a href="/" className="mt-6 underline">Terug naar checkout</a>
    </div>
  );
}

// =============================================================
// That’s it! Tailwind handles styling; tweak colours/sizes as needed.
// =============================================================
