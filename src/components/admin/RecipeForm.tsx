"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileText, ImagePlus, Link2, LoaderCircle, Plus, Save, Trash2, Upload } from "lucide-react";
import { saveRecipe } from "@/app/admin/actions";
import { compressImage, imageExtension } from "@/lib/image";
import { formatFileSize, youtubeId, youtubeThumbnail, type RecipeView } from "@/lib/recipes";
import { uploadFile } from "@/lib/upload";
import { uuid } from "@/lib/uuid";

type LinkRow = { key: string; label: string; url: string };
type FileRow = { key: string; name: string; path: string; size: number };
type ProductOption = { id: string; name: string };

const MAX_FILE = 20 * 1024 * 1024;
const FILE_TYPES: Record<string, string> = {
  "application/pdf": "pdf",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const input =
  "mt-1 w-full rounded-xl border border-amber-100 bg-creme-claro px-3 py-2.5 text-grafite outline-none focus:border-terracota focus:ring-2 focus:ring-terracota/20";
const card = "rounded-2xl border border-amber-100 bg-white p-5 shadow-sm";
const newKey = () => uuid();

/** Recomeça limpo a cada visita nova (o Next guarda páginas escondidas). */
export default function RecipeForm(props: { recipe?: RecipeView; products: ProductOption[] }) {
  const { bfcacheId } = useRouter();
  return <Form key={bfcacheId} {...props} />;
}

function Form({ recipe, products }: { recipe?: RecipeView; products: ProductOption[] }) {
  const [title, setTitle] = useState(recipe?.title ?? "");
  const [productId, setProductId] = useState(recipe?.product_id ?? "");
  const [notes, setNotes] = useState(recipe?.notes ?? "");
  const [photoPath, setPhotoPath] = useState(recipe?.photo_path ?? null);
  const [photoPreview, setPhotoPreview] = useState(recipe?.photoUrl ?? null);
  const [links, setLinks] = useState<LinkRow[]>(() =>
    recipe?.links.length
      ? recipe.links.map((l) => ({ key: newKey(), ...l }))
      : [{ key: newKey(), label: "", url: "" }],
  );
  const [files, setFiles] = useState<FileRow[]>(() =>
    (recipe?.files ?? []).map(({ name, path, size }) => ({ key: newKey(), name, path, size })),
  );
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [error, setError] = useState("");
  const [saving, startSaving] = useTransition();

  const updateLink = (key: string, patch: Partial<LinkRow>) =>
    setLinks((list) => list.map((l) => (l.key === key ? { ...l, ...patch } : l)));

  async function handlePhoto(file: File | undefined) {
    if (!file) return;
    setError("");
    setUploadingPhoto(true);
    try {
      const blob = await compressImage(file);
      setPhotoPath((await uploadFile("receita-foto", blob, imageExtension(blob))).path);
      setPhotoPreview(URL.createObjectURL(blob));
    } catch {
      setError("Não foi possível enviar a foto. Tente outra imagem.");
    } finally {
      setUploadingPhoto(false);
    }
  }

  async function handleFiles(list: FileList | null) {
    if (!list?.length) return;
    setError("");
    setUploadingFiles(true);
    try {
      for (const file of Array.from(list)) {
        const ext = FILE_TYPES[file.type];
        if (!ext) throw new Error(`“${file.name}” não é PDF nem imagem.`);
        if (file.size > MAX_FILE) throw new Error(`“${file.name}” passa de 20 MB.`);
        const { path } = await uploadFile("receita-arquivo", file, ext);
        setFiles((rows) => [...rows, { key: newKey(), name: file.name, path, size: file.size }]);
      }
    } catch (e) {
      setError(e instanceof Error && e.message.includes("“") ? e.message : "Não foi possível enviar o arquivo.");
    } finally {
      setUploadingFiles(false);
    }
  }

  function save() {
    setError("");
    startSaving(async () => {
      const res = await saveRecipe({
        id: recipe?.id,
        title,
        notes,
        productId: productId || null,
        photoPath,
        links: links.map(({ label, url }) => ({ label, url })),
        files: files.map(({ name, path, size }) => ({ name, path, size })),
      });
      if (res?.error) setError(res.error);
    });
  }

  const busy = saving || uploadingPhoto || uploadingFiles;

  return (
    <div className="grid gap-6 pb-24 lg:grid-cols-[20rem_1fr] lg:items-start lg:pb-0">
      {/* Foto do trabalho */}
      <section className={card}>
        <span className="text-sm font-bold text-grafite">Foto do trabalho pronto</span>
        <label className="group relative mt-2 flex aspect-square cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-amber-200 bg-creme-claro hover:border-terracota">
          {photoPreview ? (
            <Image src={photoPreview} alt="" fill unoptimized className="object-cover" />
          ) : (
            <span className="flex flex-col items-center gap-2 px-6 text-center text-sm text-cafe">
              <ImagePlus className="size-8 text-terracota" />
              Toque para escolher uma foto
            </span>
          )}
          {uploadingPhoto && (
            <span className="absolute inset-0 grid place-items-center bg-white/70">
              <LoaderCircle className="size-8 animate-spin text-terracota" />
            </span>
          )}
          <input type="file" accept="image/*" className="sr-only" onChange={(e) => handlePhoto(e.target.files?.[0])} />
        </label>
        {photoPreview && (
          <button
            type="button"
            onClick={() => {
              setPhotoPath(null);
              setPhotoPreview(null);
            }}
            className="mt-2 text-sm font-bold text-cafe hover:text-terracota-escuro"
          >
            Remover foto
          </button>
        )}
        <p className="mt-2 text-xs text-cafe">Sem foto, aparece a miniatura do vídeo do YouTube.</p>
      </section>

      <div className="space-y-5">
        <section className={`${card} grid gap-4 sm:grid-cols-2`}>
          <label className="block sm:col-span-2">
            <span className="text-sm font-bold text-grafite">Nome da receita *</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
              placeholder="Ex.: Ursinho de pelúcia – canal da Fulana"
              className={input}
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-sm font-bold text-grafite">Peça do catálogo (opcional)</span>
            <select value={productId} onChange={(e) => setProductId(e.target.value)} className={input}>
              <option value="">— nenhuma —</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
        </section>

        {/* Links */}
        <section className={card}>
          <h2 className="flex items-center gap-2 font-bold text-grafite">
            <Link2 className="size-4 text-terracota" /> Vídeos e links
          </h2>
          <p className="text-sm text-cafe">Cole o link do YouTube, Instagram, blog…</p>
          <ul className="mt-4 space-y-3">
            {links.map((l, i) => {
              const yt = youtubeId(l.url);
              return (
                <li key={l.key} className="rounded-xl border border-amber-100 bg-creme-claro/60 p-3">
                  <div className="flex items-end gap-2">
                    <label className="block flex-1">
                      <span className="text-xs font-bold text-cafe">Link {i + 1}</span>
                      <input
                        type="url"
                        inputMode="url"
                        value={l.url}
                        onChange={(e) => updateLink(l.key, { url: e.target.value })}
                        placeholder="https://youtu.be/…"
                        className={input}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => setLinks((list) => list.filter((x) => x.key !== l.key))}
                      aria-label={`Remover link ${i + 1}`}
                      className="mb-0.5 grid size-11 place-items-center rounded-xl text-cafe hover:bg-rosa-claro hover:text-terracota-escuro"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                  <div className="mt-2 flex items-center gap-3">
                    {yt && (
                      <Image
                        src={youtubeThumbnail(yt)}
                        alt=""
                        width={64}
                        height={48}
                        unoptimized
                        className="h-12 w-16 shrink-0 rounded-lg object-cover"
                      />
                    )}
                    <label className="block flex-1">
                      <span className="text-xs font-bold text-cafe">
                        Descrição {yt && <span className="text-terracota">· vídeo do YouTube reconhecido</span>}
                      </span>
                      <input
                        value={l.label}
                        onChange={(e) => updateLink(l.key, { label: e.target.value })}
                        placeholder={yt ? "Vídeo no YouTube" : "Ex.: Gráfico no blog"}
                        className={input}
                      />
                    </label>
                  </div>
                </li>
              );
            })}
          </ul>
          <button
            type="button"
            onClick={() => setLinks((list) => [...list, { key: newKey(), label: "", url: "" }])}
            className="mt-3 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white px-4 py-2 text-sm font-bold text-terracota-escuro hover:border-terracota"
          >
            <Plus className="size-4" /> Adicionar link
          </button>
        </section>

        {/* Arquivos */}
        <section className={card}>
          <h2 className="flex items-center gap-2 font-bold text-grafite">
            <FileText className="size-4 text-terracota" /> PDFs e gráficos
          </h2>
          <p className="text-sm text-cafe">Receitas em PDF ou fotos de gráficos (até 20 MB cada). Ficam privados.</p>
          {files.length > 0 && (
            <ul className="mt-4 space-y-2">
              {files.map((f) => (
                <li key={f.key} className="flex items-center gap-3 rounded-xl border border-amber-100 bg-creme-claro/60 px-3 py-2">
                  <FileText className="size-5 shrink-0 text-terracota" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-grafite">{f.name}</span>
                    <span className="text-xs text-cafe">{formatFileSize(f.size)}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setFiles((rows) => rows.filter((x) => x.key !== f.key))}
                    aria-label={`Remover ${f.name}`}
                    className="grid size-10 place-items-center rounded-xl text-cafe hover:bg-rosa-claro hover:text-terracota-escuro"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-full border border-amber-200 bg-white px-4 py-2 text-sm font-bold text-terracota-escuro hover:border-terracota">
            {uploadingFiles ? <LoaderCircle className="size-4 animate-spin" /> : <Upload className="size-4" />}
            {uploadingFiles ? "Enviando…" : "Enviar PDF ou imagem"}
            <input
              type="file"
              accept="application/pdf,image/jpeg,image/png,image/webp"
              multiple
              className="sr-only"
              disabled={uploadingFiles}
              onChange={(e) => {
                handleFiles(e.target.files);
                e.target.value = "";
              }}
            />
          </label>
        </section>

        <section className={card}>
          <label className="block">
            <span className="text-sm font-bold text-grafite">Anotações</span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={5}
              placeholder={"Agulha 2,5 mm · linha Amigurumi\nNo vídeo ela usa 6 pontos no anel, eu faço 8\nTamanho final: 25 cm"}
              className={input}
            />
          </label>
        </section>

        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-amber-100 bg-white/95 px-4 py-3 backdrop-blur lg:static lg:border-0 lg:bg-transparent lg:p-0">
          {error && (
            <p role="alert" className="mb-3 rounded-xl bg-rosa-claro px-4 py-2.5 text-sm text-terracota-escuro">
              {error}
            </p>
          )}
          <div className="flex items-center justify-end gap-3">
            <Link
              href={recipe ? `/admin/receitas/${recipe.id}` : "/admin/receitas"}
              className="px-4 py-3 text-sm font-bold text-cafe hover:text-grafite"
            >
              Cancelar
            </Link>
            <button
              type="button"
              onClick={save}
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-2xl bg-terracota px-6 py-3 font-bold text-white shadow-sm hover:bg-terracota-escuro disabled:opacity-60"
            >
              {saving ? <LoaderCircle className="size-4 animate-spin" /> : <Save className="size-4" />}
              Salvar receita
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

