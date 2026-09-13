export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          designation: string | null;
          phone: string | null;
          email: string | null;
          website: string | null;
          linkedin: string | null;
          address: string | null;
          language: string;
          tone: string;
          signature: string | null;
          active_company_id: string | null;
          plan: "free" | "pro" | "business";
          onboarding_completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & {
          id: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
        Relationships: [];
      };
      companies: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          industry: string | null;
          description: string | null;
          products: string | null;
          services: string | null;
          usp: string | null;
          target_audience: string | null;
          customer_type: string | null;
          website: string | null;
          brand_voice: string | null;
          achievements: string | null;
          differentiators: string | null;
          contact_information: string | null;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["companies"]["Row"]> & {
          user_id: string;
          name: string;
        };
        Update: Partial<Database["public"]["Tables"]["companies"]["Row"]>;
        Relationships: [];
      };
      email_generations: {
        Row: {
          id: string;
          user_id: string;
          company_id: string | null;
          prompt: string;
          intent: string | null;
          recipient_type: string | null;
          objective: string | null;
          tone: string | null;
          language: string | null;
          length: string | null;
          mode: string | null;
          subject: string | null;
          subject_options: Json;
          body: string;
          structured_output: Json | null;
          quality_score: number | null;
          quality_breakdown: Json | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["email_generations"]["Row"]> & {
          user_id: string;
          prompt: string;
          body: string;
        };
        Update: Partial<Database["public"]["Tables"]["email_generations"]["Row"]>;
        Relationships: [];
      };
      saved_templates: {
        Row: {
          id: string;
          user_id: string;
          company_id: string | null;
          name: string;
          category: string;
          subject: string | null;
          body: string;
          tone: string | null;
          language: string | null;
          favorite: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["saved_templates"]["Row"]> & {
          user_id: string;
          name: string;
          body: string;
        };
        Update: Partial<Database["public"]["Tables"]["saved_templates"]["Row"]>;
        Relationships: [];
      };
      email_connections: {
        Row: {
          id: string;
          user_id: string;
          provider: "gmail" | "outlook";
          provider_account_id: string | null;
          email_address: string | null;
          access_token_encrypted: string | null;
          refresh_token_encrypted: string | null;
          token_expires_at: string | null;
          scopes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["email_connections"]["Row"]> & {
          user_id: string;
          provider: "gmail" | "outlook";
        };
        Update: Partial<Database["public"]["Tables"]["email_connections"]["Row"]>;
        Relationships: [];
      };
      usage_daily: {
        Row: {
          user_id: string;
          usage_date: string;
          generations_count: number;
        };
        Insert: Partial<Database["public"]["Tables"]["usage_daily"]["Row"]> & {
          user_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["usage_daily"]["Row"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
