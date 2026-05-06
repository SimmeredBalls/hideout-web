// lib/uploadImage.ts
import { createClient } from "@/lib/supabase/client"; 

export const uploadRoomImage = async (
  file: File, 
  // We add 'categories' and keep 'types' just in case. 
  // 'rooms' can be removed later if you're sure you won't need it.
  folder: 'types' | 'rooms' | 'categories' 
) => {
  const supabase = createClient(); 
  
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `${folder}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('hideout-media')
    .upload(filePath, file);

  if (uploadError) {
    console.error("Upload error details:", uploadError);
    throw uploadError;
  }

  const { data } = supabase.storage
    .from('hideout-media')
    .getPublicUrl(filePath);

  return data.publicUrl;
};