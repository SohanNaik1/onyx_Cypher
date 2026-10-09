import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center gap-6 p-6 text-center">
      <h1 className="text-4xl font-bold">Launch-Your-Store</h1>
      <p className="text-gray-600">Set up your online store in a few steps.</p>
      <Link href="/onboarding" className="rounded-lg bg-black px-6 py-3 text-white">
        Get started
      </Link>
    </main>
  );
}
