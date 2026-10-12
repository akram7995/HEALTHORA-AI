import { createClient, SupabaseClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL?.trim();
const supabaseServiceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY)?.trim();

let client: SupabaseClient | null = null;
let connectionTested = false;
let isConnected = false;
let connectionError: string | null = null;

if (supabaseUrl && supabaseServiceKey) {
  try {
    client = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  } catch (err: any) {
    connectionError = err?.message || "Failed to initialize Supabase client";
    console.warn("Supabase init error:", connectionError);
  }
}

export async function testSupabaseConnection(): Promise<{
  configured: boolean;
  connected: boolean;
  url?: string;
  message: string;
}> {
  if (!supabaseUrl || !supabaseServiceKey) {
    return {
      configured: false,
      connected: false,
      message: "Supabase credentials are not configured in environment (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY). Using persistent on-disk database with identical RLS schemas.",
    };
  }

  if (!client) {
    return {
      configured: true,
      connected: false,
      url: supabaseUrl,
      message: connectionError || "Client failed to initialize with provided credentials.",
    };
  }

  try {
    // Attempt a light query to test connectivity
    const { error } = await client.from("profiles").select("id").limit(1);
    if (error && !error.message.includes("relation \"profiles\" does not exist")) {
      // If table doesn't exist yet, connection works but migration is needed
      isConnected = false;
      return {
        configured: true,
        connected: false,
        url: supabaseUrl,
        message: `Connected to endpoint, but table error: ${error.message}. Please run the migration script in /supabase/migrations/`,
      };
    }
    isConnected = true;
    return {
      configured: true,
      connected: true,
      url: supabaseUrl,
      message: "Connected securely to remote Supabase PostgreSQL database.",
    };
  } catch (err: any) {
    isConnected = false;
    return {
      configured: true,
      connected: false,
      url: supabaseUrl,
      message: `Connection failed: ${err?.message || "Network error"}`,
    };
  }
}

export function getSupabaseClient(): SupabaseClient | null {
  return client;
}

export function isSupabaseConfigured(): boolean {
  return !!(supabaseUrl && supabaseServiceKey);
}
