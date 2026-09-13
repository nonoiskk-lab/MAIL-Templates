import { CheckCircle2 } from "lucide-react";
import { getSessionUser, getProfile } from "@/lib/data/user";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const metadata = { title: "Billing" };

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    features: ["Limited daily generations", "Basic templates", "Basic personalization"],
  },
  {
    id: "pro",
    name: "Pro",
    price: "—",
    features: [
      "Higher AI limits",
      "Full Brand Brain",
      "Unlimited templates",
      "Gmail & Outlook sending",
      "Advanced rewriting & follow-up AI",
      "Multiple companies",
    ],
  },
  {
    id: "business",
    name: "Business",
    price: "—",
    features: ["Team accounts", "Shared templates", "Admin analytics", "Team Brand Brain"],
  },
];

export default async function BillingPage() {
  const { user } = await getSessionUser();
  const profile = user ? await getProfile(user.id) : null;
  const currentPlan = profile?.plan ?? "free";

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Billing</h2>
        <p className="text-sm text-muted-foreground">
          Billing is not connected yet — this is the plan structure MailCraft AI is built for.
          Wire up Stripe or another billing provider to enable upgrades.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {PLANS.map((plan) => (
          <Card key={plan.id} className={cn(currentPlan === plan.id && "border-secondary")}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{plan.name}</CardTitle>
                {currentPlan === plan.id && <Badge variant="secondary">Current</Badge>}
              </div>
              <CardDescription>{plan.price}/mo</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
