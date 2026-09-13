import { MailCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function CheckEmailPage() {
  return (
    <Card>
      <CardHeader className="items-center text-center">
        <MailCheck className="mb-2 h-10 w-10 text-secondary" />
        <CardTitle>Check your inbox</CardTitle>
        <CardDescription>
          If an account exists for that email, a reset link is on its way.
        </CardDescription>
      </CardHeader>
      <CardContent />
    </Card>
  );
}
