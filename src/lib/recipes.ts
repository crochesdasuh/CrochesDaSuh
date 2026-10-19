// Caderno de receitas: tipos e utilitários usados no servidor e no navegador.

export const RECIPES_BUCKET = "receitas";

export type RecipeLink = { label: string; url: string };
export type RecipeFile = { name: string; path: string; size: number };

export type RecipeRow = {
  id: string;
  title: string;
  notes: string;
  product_id: string | null;
  photo_path: string | null;
  links: RecipeLink[];
  files: RecipeFile[];
  updated_at: string;
};

/** Receita pronta para exibir: com links temporários para a foto e os arquivos privados. */
export type RecipeView = Omit<RecipeRow, "files"> & {
  photoUrl: string | null;
  thumbnailUrl: string | null;
  files: (RecipeFile & { url: string | null })[];
};

/** Caminho de arquivo enviado pelo painel: "<uuid>.<extensão>". */
export const STORAGE_PATH = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(pdf|webp|jpg|png)$/;

/** ID do vídeo em qualquer formato de link do YouTube (watch, youtu.be, shorts, live, embed). */
export function youtubeId(url: string): string | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^(www|m|music)\./, "");
    let id: string | null = null;
    if (host === "youtu.be") id = u.pathname.slice(1);
    else if (host === "youtube.com" || host === "youtube-nocookie.com") {
      id = u.searchParams.get("v") ?? u.pathname.match(/^\/(?:shorts|live|embed)\/([^/?]+)/)?.[1] ?? null;
    }
    return id && /^[\w-]{11}$/.test(id) ? id : null;
  } catch {
    return null;
  }
}

export const youtubeThumbnail = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
export const youtubeEmbed = (id: string) => `https://www.youtube-nocookie.com/embed/${id}`;

export function isHttpUrl(url: string) {
  try {
    return ["http:", "https:"].includes(new URL(url).protocol);
  } catch {
    return false;
  }
}

export function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / 1024 / 1024).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} MB`;
}
