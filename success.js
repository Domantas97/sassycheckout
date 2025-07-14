import Link from 'next/link';

export default function Success() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center space-y-6">
      <h1 className="text-3xl font-bold">Payment successful! 🎉</h1>
      <p>Thank you for your purchase. You will receive a confirmation email shortly.</p>
      <Link href="/" className="text-blue-600 underline">
        Back to shop
      </Link>
    </div>
  );
}
