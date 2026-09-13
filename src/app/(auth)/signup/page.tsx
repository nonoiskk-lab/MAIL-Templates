"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signUp } from "@/app/auth/actions";
import { SubmitButton } from "@/components/auth/submit-button";
import { GoogleButton } from "@/components/auth/google-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export default function SignupPage() {
  const [state, formAction] = useActionState(signUp, null);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create your account</CardTitle>
        <CardDescription>Start writing professional emails in seconds.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <GoogleButton />
        <div className="flex items-center gap-3">
          <Separator className="flex-1" />
          <span className="text-xs text-muted-foreground">or</span>
          <Separator className="flex-1" />
        </div>
        <form action={formAction} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="fullName">Full name</Label>
            <Input id="fullName" name="fullName" placeholder="Jordan Lee" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="you@company.com" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" placeholder="At least 8 characters" required minLength={8} />
          </div>
          {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
          <SubmitButton pendingText="Creating account…">Create account</SubmitButton>
        </form>
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-secondary hover:underline">
            Log in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
