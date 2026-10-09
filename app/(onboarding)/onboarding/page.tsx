import Wizard from "@/components/onboarding/Wizard";

export const metadata = { title: "Set up your store · Launch-Your-Store" };

export default function OnboardingPage() {
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-6 sm:py-12">
      <h1 className="mb-6 text-center text-2xl font-bold sm:text-3xl">Launch your store</h1>
      <Wizard />
    </main>
  );
}
