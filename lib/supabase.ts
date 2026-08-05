import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars. See .env.example.",
  );
}

// Server-only client, authenticated with the service_role key. This must
// never be imported from client components or exposed to the browser — it
// bypasses row-level security entirely. All tables are RLS-locked with no
// policies, so this is the only credential that can read or write them.
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
});
