import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { env } from "./env";

export const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey);

export const createAuthenticatedSupabaseClient = (
  accessToken: string,
): SupabaseClient => {
  return createClient(env.supabaseUrl, env.supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });
};
