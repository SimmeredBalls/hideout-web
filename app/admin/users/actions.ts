"use server"

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Creates a new staff/admin account.
 * Uses the Admin Client to bypass RLS and auto-confirm the email.
 */
export async function createStaffAccount(formData: any) {
  const supabaseAdmin = await createAdminClient();

  // 1. Create the Auth User in the internal auth.users table
  const { data, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: formData.email,
    password: formData.password,
    email_confirm: true, // Bypasses the need for the user to click a link
    user_metadata: { 
      full_name: formData.fullName 
    }
  });

  if (authError) return { error: authError.message };

  // 2. Update the Profile with the specific role (Admin/Staff)
  const supabase = await createClient();
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      full_name: formData.fullName,
      phone_number: formData.phone,
      role: formData.role 
    })
    .eq('id', data.user?.id);

  if (profileError) return { error: profileError.message };

  revalidatePath("/admin/users");
  return { success: true };
}

/**
 * Deletes a user completely from the system.
 * Because of the 'ON DELETE CASCADE' on your profiles_id_fkey,
 * deleting from auth.users will automatically delete from public.profiles.
 */
export async function deleteUserAction(userId: string) {
  const supabaseAdmin = await createAdminClient();

  // Use the admin namespace to remove the user from the identity provider
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

  if (error) {
    console.error("Deletion Error:", error.message);
    return { error: error.message };
  }

  // Refresh the UI so the deleted user disappears from the list
  revalidatePath("/admin/users");
  return { success: true };
}