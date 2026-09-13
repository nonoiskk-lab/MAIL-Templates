"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";

const profileSchema = z.object({
  fullName: z.string().max(120).optional(),
  designation: z.string().max(120).optional(),
  phone: z.string().max(40).optional(),
  email: z.string().email().optional().or(z.literal("")),
  website: z.string().max(200).optional(),
  linkedin: z.string().max(200).optional(),
  address: z.string().max(300).optional(),
  language: z.enum(["auto", "english", "hindi", "hinglish"]).default("auto"),
  tone: z.string().max(60).default("professional"),
  signature: z.string().max(600).optional(),
});

export type ProfileActionState = { error?: string; success?: boolean } | null;

export async function updateProfile(
  _prevState: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const parsed = profileSchema.safeParse({
    fullName: formData.get("fullName")?.toString(),
    designation: formData.get("designation")?.toString(),
    phone: formData.get("phone")?.toString(),
    email: formData.get("email")?.toString(),
    website: formData.get("website")?.toString(),
    linkedin: formData.get("linkedin")?.toString(),
    address: formData.get("address")?.toString(),
    language: formData.get("language")?.toString() ?? "auto",
    tone: formData.get("tone")?.toString() ?? "professional",
    signature: formData.get("signature")?.toString(),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please log in." };

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.fullName || null,
      designation: parsed.data.designation || null,
      phone: parsed.data.phone || null,
      email: parsed.data.email || user.email || null,
      website: parsed.data.website || null,
      linkedin: parsed.data.linkedin || null,
      address: parsed.data.address || null,
      language: parsed.data.language,
      tone: parsed.data.tone,
      signature: parsed.data.signature || null,
    })
    .eq("id", user.id);

  if (error) return { error: "Could not save your profile." };

  revalidatePath("/settings/profile");
  return { success: true };
}

export async function completeOnboarding() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("profiles").update({ onboarding_completed: true }).eq("id", user.id);
}

export async function deleteAccount() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Deleting the auth user cascades to profiles/companies/generations/etc.
  // via the ON DELETE CASCADE foreign keys defined in the schema.
  const admin = createServiceRoleClient();
  await admin.auth.admin.deleteUser(user.id);
  await supabase.auth.signOut();
  redirect("/");
}
