import Link from 'next/link';

export default function Cancel() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center space-y-6">
      <h1 className="text-3xl font-bold">Payment canceled</h1>
      <p>No worries – you can try again anytime.</p>
      <Link href="/" className="text-blue-600 underline">
        Return to checkout
      </Link>
    </div>
  );
}
