import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";

export const metadata = { title: "Welcome" };

export default function OnboardingPage() {
  return (
    <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
      <OnboardingWizard />
    </div>
  );
}
