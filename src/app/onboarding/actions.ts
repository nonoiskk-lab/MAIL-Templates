"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const onboardingSchema = z.object({
  fullName: z.string().max(120).optional(),
  designation: z.string().max(120).optional(),
  companyName: z.string().max(160).optional(),
  industry: z.string().max(160).optional(),
  tone: z.string().max(60).default("professional"),
  signature: z.string().max(600).optional(),
});

export async function saveOnboarding(input: z.infer<typeof onboardingSchema>) {
  const parsed = onboardingSchema.parse(input);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase
    .from("profiles")
    .update({
      full_name: parsed.fullName || null,
      designation: parsed.designation || null,
      tone: parsed.tone,
      signature: parsed.signature || null,
      onboarding_completed: true,
    })
    .eq("id", user.id);

  if (parsed.companyName) {
    const { data: company } = await supabase
      .from("companies")
      .insert({
        user_id: user.id,
        name: parsed.companyName,
        industry: parsed.industry || null,
        is_default: true,
      })
      .select("id")
      .single();

    if (company) {
      await supabase.from("profiles").update({ active_company_id: company.id }).eq("id", user.id);
    }
  }
}

export async function skipOnboarding() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  await supabase.from("profiles").update({ onboarding_completed: true }).eq("id", user.id);
}
