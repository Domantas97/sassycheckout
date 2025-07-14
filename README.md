# Stripe Checkout – Next.js on Vercel

A minimal two‑column checkout flow styled with Tailwind CSS and powered by **Stripe Checkout**.

## Quick start

```bash
git clone <your fork> && cd stripe-nextjs-checkout
cp .env.example .env.local   # add your Stripe keys
npm install                 # or pnpm install / yarn
npm run dev                 # local dev at http://localhost:3000
```

### Deploy on Vercel

1. Push this repo to GitHub.
2. In the Vercel dashboard, **Import Project** → link your GitHub repo.
3. In **Environment Variables**, add:
   * `STRIPE_SECRET_KEY`
   * `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   * `STRIPE_PRICE_ID`
4. Click **Deploy** – that’s it. Vercel will install deps and run `next build`.

## File structure

```
.
├── pages/
│   ├── _app.js
│   ├── index.js
│   ├── success.js
│   ├── cancel.js
│   └── api/
│       └── create-checkout-session.js
├── styles/globals.css
└── ...
```

---  
Built 2025‑07‑14
