"use client";

import { useActionState, useEffect } from "react";
import { updateProfile } from "@/app/(app)/settings/profile/actions";
import { SubmitButton } from "@/components/auth/submit-button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { TONE_OPTIONS, LANGUAGE_OPTIONS } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/types/database";

type Profile = Database["public"]["Tables"]["profiles"]["Row"] | null;

export function ProfileForm({
  profile,
  fallbackEmail,
}: {
  profile: Profile;
  fallbackEmail: string;
}) {
  const [state, formAction] = useActionState(updateProfile, null);
  const { toast } = useToast();

  useEffect(() => {
    if (state?.success) {
      toast({ title: "Profile saved" });
    }
  }, [state, toast]);

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-1.5">
        <Label htmlFor="fullName">Full name</Label>
        <Input id="fullName" name="fullName" defaultValue={profile?.full_name ?? ""} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="designation">Designation</Label>
        <Input id="designation" name="designation" defaultValue={profile?.designation ?? ""} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" defaultValue={profile?.email ?? fallbackEmail} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" name="phone" defaultValue={profile?.phone ?? ""} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="website">Website</Label>
        <Input id="website" name="website" defaultValue={profile?.website ?? ""} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="linkedin">LinkedIn</Label>
        <Input id="linkedin" name="linkedin" defaultValue={profile?.linkedin ?? ""} />
      </div>
      <div className="space-y-1.5 sm:col-span-2">
        <Label htmlFor="address">Address</Label>
        <Input id="address" name="address" defaultValue={profile?.address ?? ""} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="language">Preferred language</Label>
        <NativeSelect id="language" name="language" defaultValue={profile?.language ?? "auto"}>
          {LANGUAGE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </NativeSelect>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="tone">Preferred tone</Label>
        <NativeSelect id="tone" name="tone" defaultValue={profile?.tone ?? "professional"}>
          {TONE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </NativeSelect>
      </div>
      <div className="space-y-1.5 sm:col-span-2">
        <Label htmlFor="signature">Default signature</Label>
        <Textarea
          id="signature"
          name="signature"
          rows={4}
          placeholder={"Best regards,\nJordan Lee\nHead of Partnerships, Acme Inc."}
          defaultValue={profile?.signature ?? ""}
        />
      </div>
      {state?.error && <p className="text-sm text-destructive sm:col-span-2">{state.error}</p>}
      <div className="sm:col-span-2">
        <SubmitButton className="w-auto" pendingText="Saving…">
          Save changes
        </SubmitButton>
      </div>
    </form>
  );
}
