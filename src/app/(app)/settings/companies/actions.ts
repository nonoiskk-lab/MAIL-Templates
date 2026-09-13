"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const companySchema = z.object({
  name: z.string().min(1, "Company name is required.").max(160),
  industry: z.string().max(160).optional(),
  description: z.string().max(1000).optional(),
  products: z.string().max(1000).optional(),
  services: z.string().max(1000).optional(),
  usp: z.string().max(500).optional(),
  targetAudience: z.string().max(500).optional(),
  customerType: z.string().max(200).optional(),
  website: z.string().max(200).optional(),
  brandVoice: z.string().max(500).optional(),
  achievements: z.string().max(1000).optional(),
  differentiators: z.string().max(1000).optional(),
  contactInformation: z.string().max(500).optional(),
});

export type CompanyActionState = { error?: string; success?: boolean } | null;

function toRow(parsed: z.infer<typeof companySchema>) {
  return {
    name: parsed.name,
    industry: parsed.industry || null,
    description: parsed.description || null,
    products: parsed.products || null,
    services: parsed.services || null,
    usp: parsed.usp || null,
    target_audience: parsed.targetAudience || null,
    customer_type: parsed.customerType || null,
    website: parsed.website || null,
    brand_voice: parsed.brandVoice || null,
    achievements: parsed.achievements || null,
    differentiators: parsed.differentiators || null,
    contact_information: parsed.contactInformation || null,
  };
}

function fromFormData(formData: FormData) {
  return companySchema.safeParse({
    name: formData.get("name")?.toString(),
    industry: formData.get("industry")?.toString(),
    description: formData.get("description")?.toString(),
    products: formData.get("products")?.toString(),
    services: formData.get("services")?.toString(),
    usp: formData.get("usp")?.toString(),
    targetAudience: formData.get("targetAudience")?.toString(),
    customerType: formData.get("customerType")?.toString(),
    website: formData.get("website")?.toString(),
    brandVoice: formData.get("brandVoice")?.toString(),
    achievements: formData.get("achievements")?.toString(),
    differentiators: formData.get("differentiators")?.toString(),
    contactInformation: formData.get("contactInformation")?.toString(),
  });
}

export async function createCompany(
  _prevState: CompanyActionState,
  formData: FormData,
): Promise<CompanyActionState> {
  const parsed = fromFormData(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please log in." };

  const { count } = await supabase
    .from("companies")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  const { data: created, error } = await supabase
    .from("companies")
    .insert({ user_id: user.id, is_default: (count ?? 0) === 0, ...toRow(parsed.data) })
    .select("id")
    .single();

  if (error || !created) return { error: "Could not create the company." };

  if ((count ?? 0) === 0) {
    await supabase.from("profiles").update({ active_company_id: created.id }).eq("id", user.id);
  }

  revalidatePath("/settings/companies");
  revalidatePath("/", "layout");
  return { success: true };
}

export async function updateCompany(
  companyId: string,
  _prevState: CompanyActionState,
  formData: FormData,
): Promise<CompanyActionState> {
  const parsed = fromFormData(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please log in." };

  const { error } = await supabase
    .from("companies")
    .update(toRow(parsed.data))
    .eq("id", companyId)
    .eq("user_id", user.id);

  if (error) return { error: "Could not update the company." };

  revalidatePath("/settings/companies");
  revalidatePath("/", "layout");
  return { success: true };
}

export async function deleteCompany(companyId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("companies").delete().eq("id", companyId).eq("user_id", user.id);
  revalidatePath("/settings/companies");
  revalidatePath("/", "layout");
}
