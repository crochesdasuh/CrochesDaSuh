import { createClient } from "@supabase/supabase-js";
import { createUploadTarget, type UploadKind } from "@/app/admin/actions";
import { SUPABASE_KEY, SUPABASE_URL } from "@/lib/supabase/env";

/**
 * Envia um arquivo do painel ao Supabase usando um ingresso de uso único gerado
 * no servidor. O cliente abaixo não tem sessão nem guarda nada no navegador.
 */
export async function uploadFile(kind: UploadKind, file: Blob, ext: string) {
  const target = await createUploadTarget(kind, ext);
  const storage = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  }).storage;
  const { error } = await storage
    .from(target.bucket)
    .uploadToSignedUrl(target.path, target.token, file, {
      contentType: file.type,
      // Nome do arquivo é único (uuid): pode ficar em cache "para sempre".
      cacheControl: "31536000",
    });
  if (error) throw error;
  return { path: target.path, publicUrl: target.publicUrl };
}
