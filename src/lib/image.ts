// Utilitário do navegador para fotos tiradas no celular (podem ter 5 MB ou mais).

/** Reduz a foto (máx. 1600 px) e converte para WebP/JPEG antes de enviar. */
export async function compressImage(file: File) {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const toBlob = (type: string) =>
    new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, 0.85));
  let blob = await toBlob("image/webp");
  // Safari antigo não gera WebP e devolve PNG: nesse caso usa JPEG.
  if (!blob || blob.type !== "image/webp") blob = await toBlob("image/jpeg");
  if (!blob) throw new Error("Não foi possível processar a imagem.");
  return blob;
}

/** Extensão do arquivo conforme o formato gerado por compressImage. */
export const imageExtension = (blob: Blob) => (blob.type === "image/webp" ? "webp" : "jpg");
