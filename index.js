import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import Head from 'next/head';
import clsx from 'clsx';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

export default function Checkout() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '' });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      const stripe = await stripePromise;
      await stripe.redirectToCheckout({ sessionId: data.sessionId, url: data.url });
    } catch (err) {
      console.error(err);
      alert('Failed to redirect to Stripe. See console.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Sassy Scalp – Checkout</title>
      </Head>
      <div className="min-h-screen flex flex-col">
        <header className="bg-[color:var(--brand-beige)] py-4 px-6">
          <h1 className="font-bold text-2xl tracking-tight">SASSY SCALP</h1>
        </header>

        <main className="flex-1 flex flex-col lg:flex-row max-w-5xl w-full mx-auto">
          {/* LEFT: FORM */}
          <form
            onSubmit={handleSubmit}
            className="flex-1 px-6 py-8 space-y-8"
          >
            <section>
              <h2 className="font-medium text-lg mb-4">Contact</h2>
              <input
                name="email"
                type="email"
                required
                placeholder="E‑mail or mobile"
                className="w-full border rounded p-3"
                value={formData.email}
                onChange={handleChange}
              />
            </section>

            <section>
              <h2 className="font-medium text-lg mb-4">Payment</h2>
              <div className="space-y-4">
                <label className="flex items-center space-x-3">
                  <input type="radio" name="method" defaultChecked />
                  <span>Credit / debit card</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input type="radio" name="method" disabled />
                  <span className="opacity-50">PayPal (coming soon)</span>
                </label>
              </div>
            </section>

            <button
              type="submit"
              disabled={loading}
              className={clsx(
                'w-full py-3 rounded text-white font-semibold',
                loading ? 'bg-gray-400' : 'bg-black hover:bg-neutral-800'
              )}
            >
              {loading ? 'Redirecting…' : 'Go to pay'}
            </button>
          </form>

          {/* RIGHT: SUMMARY */}
          <aside className="lg:w-80 bg-neutral-100 px-6 py-8">
            <div className="flex items-start space-x-4">
              <img
                src="https://dummyimage.com/72x72/eee/aaa"
                alt="Product"
                className="w-16 h-16 rounded object-cover"
              />
              <div>
                <p className="font-medium">Scalp Rebalancing Kit</p>
                <p className="text-sm text-gray-500">3 months</p>
              </div>
              <p className="ml-auto font-medium">€319,90</p>
            </div>

            <div className="mt-6 border-t pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>€319,90</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="text-gray-500">Enter address</span>
              </div>
              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>€319,90</span>
              </div>
            </div>
          </aside>
        </main>
      </div>
    </>
  );
}
