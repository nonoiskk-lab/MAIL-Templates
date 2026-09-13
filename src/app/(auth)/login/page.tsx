"use client";

import { Suspense, useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signIn } from "@/app/auth/actions";
import { SubmitButton } from "@/components/auth/submit-button";
import { GoogleButton } from "@/components/auth/google-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

function LoginForm() {
  const [state, formAction] = useActionState(signIn, null);
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome back</CardTitle>
        <CardDescription>Log in to keep writing better emails.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <GoogleButton redirectPath={redirect || undefined} />
        <div className="flex items-center gap-3">
          <Separator className="flex-1" />
          <span className="text-xs text-muted-foreground">or</span>
          <Separator className="flex-1" />
        </div>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="redirect" value={redirect} />
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="you@company.com" required />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link href="/forgot-password" className="text-xs text-secondary hover:underline">
                Forgot password?
              </Link>
            </div>
            <Input id="password" name="password" type="password" placeholder="••••••••" required />
          </div>
          {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
          <SubmitButton pendingText="Logging in…">Log in</SubmitButton>
        </form>
        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-secondary hover:underline">
            Sign up free
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
