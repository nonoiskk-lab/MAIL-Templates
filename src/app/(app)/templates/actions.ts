"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { TEMPLATE_CATEGORIES } from "@/lib/constants";

const saveTemplateSchema = z.object({
  name: z.string().min(1, "Give your template a name.").max(120),
  category: z.enum(TEMPLATE_CATEGORIES).default("other"),
  subject: z.string().max(300).default(""),
  body: z.string().min(1),
  tone: z.string().optional(),
  language: z.string().optional(),
  companyId: z.string().uuid().nullable().optional(),
});

export async function createTemplate(input: z.infer<typeof saveTemplateSchema>) {
  const parsed = saveTemplateSchema.parse(input);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Please log in to save templates.");

  const { error } = await supabase.from("saved_templates").insert({
    user_id: user.id,
    company_id: parsed.companyId ?? null,
    name: parsed.name,
    category: parsed.category,
    subject: parsed.subject,
    body: parsed.body,
    tone: parsed.tone,
    language: parsed.language,
  });

  if (error) throw new Error("Could not save the template.");
  revalidatePath("/templates");
}

export async function toggleFavoriteTemplate(id: string, favorite: boolean) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase
    .from("saved_templates")
    .update({ favorite })
    .eq("id", id)
    .eq("user_id", user.id);
  revalidatePath("/templates");
}

export async function deleteTemplate(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("saved_templates").delete().eq("id", id).eq("user_id", user.id);
  revalidatePath("/templates");
}

export async function duplicateTemplate(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: original } = await supabase
    .from("saved_templates")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!original) return;

  await supabase.from("saved_templates").insert({
    user_id: user.id,
    company_id: original.company_id,
    name: `${original.name} (copy)`,
    category: original.category,
    subject: original.subject,
    body: original.body,
    tone: original.tone,
    language: original.language,
  });
  revalidatePath("/templates");
}

const updateTemplateSchema = saveTemplateSchema.partial().extend({ id: z.string().uuid() });

export async function updateTemplate(input: z.infer<typeof updateTemplateSchema>) {
  const { id, ...rest } = updateTemplateSchema.parse(input);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Please log in.");

  await supabase
    .from("saved_templates")
    .update({
      ...(rest.name !== undefined ? { name: rest.name } : {}),
      ...(rest.category !== undefined ? { category: rest.category } : {}),
      ...(rest.subject !== undefined ? { subject: rest.subject } : {}),
      ...(rest.body !== undefined ? { body: rest.body } : {}),
      ...(rest.tone !== undefined ? { tone: rest.tone } : {}),
      ...(rest.language !== undefined ? { language: rest.language } : {}),
    })
    .eq("id", id)
    .eq("user_id", user.id);
  revalidatePath("/templates");
}
