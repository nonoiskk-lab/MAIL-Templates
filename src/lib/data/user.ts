import { createClient } from "@/lib/supabase/server";

export async function getSessionUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

export async function getProfile(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
  return data;
}

export async function getCompanies(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("companies")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });
  return data ?? [];
}

export async function getActiveCompany(userId: string) {
  const profile = await getProfile(userId);
  const companies = await getCompanies(userId);
  if (!companies.length) return { profile, companies, activeCompany: null };

  const activeCompany =
    companies.find((c) => c.id === profile?.active_company_id) ??
    companies.find((c) => c.is_default) ??
    companies[0];

  return { profile, companies, activeCompany };
}
