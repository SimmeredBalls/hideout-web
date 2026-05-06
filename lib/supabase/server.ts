import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Standard client for normal user operations
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    },
  );
}

// ADMIN client for bypass operations (Staff Creation/Deletion)
export async function createAdminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, 
    {
      cookies: {
        // We provide empty functions to satisfy the TypeScript overload
        getAll() { return []; },
        setAll(cookiesToSet) { /* No-op for admin client */ },
      },
    },
  );
}