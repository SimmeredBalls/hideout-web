"use server"

import { createClient, createAdminClient } from "@/lib/supabase/server";

export async function createStaffAccount(formData: any) {
  const supabaseAdmin = await createAdminClient();

  // Create the Auth User
  const { data, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: formData.email,
    password: formData.password,
    email_confirm: true, // Auto-confirm for staff created by Admins
    user_metadata: { 
      full_name: formData.fullName 
    }
  });

  if (authError) return { error: authError.message };

  // Update the Profile with the chosen role
  const supabase = await createClient();
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      full_name: formData.fullName,
      phone_number: formData.phone,
      role: formData.role // Using the role selected in the UI
    })
    .eq('id', data.user?.id);

  if (profileError) return { error: profileError.message };

  return { success: true };
}