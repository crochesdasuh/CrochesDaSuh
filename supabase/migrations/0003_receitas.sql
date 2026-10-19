-- Ateliê da Suh — caderno de receitas (vídeos, PDFs e fotos dos trabalhos).
-- Só o admin vê e edita. Rode no SQL Editor do Supabase depois da 0002.

create table if not exists public.recipes (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 120),
  notes text not null default '' check (char_length(notes) <= 5000),
  product_id text references public.products (id) on delete set null,
  -- Foto do trabalho pronto, no bucket privado "receitas".
  photo_path text check (photo_path ~ '^[0-9a-f-]{36}\.(webp|jpg|png)$'),
  -- [{ "label": "Vídeo da Fulana", "url": "https://youtube.com/..." }]
  links jsonb not null default '[]' check (jsonb_typeof(links) = 'array'),
  -- [{ "name": "receita.pdf", "path": "<uuid>.pdf", "size": 12345 }]
  files jsonb not null default '[]' check (jsonb_typeof(files) = 'array'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists recipes_updated_idx on public.recipes (updated_at desc);

drop trigger if exists recipes_touch on public.recipes;
create trigger recipes_touch before update on public.recipes
  for each row execute function public.touch_updated_at();

alter table public.recipes enable row level security;

create policy "admin gerencia receitas" on public.recipes
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Bucket PRIVADO: receitas compradas não podem ficar públicas.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('receitas', 'receitas', false, 20971520,
        array['application/pdf', 'image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "admin lê arquivos de receitas" on storage.objects
  for select to authenticated using (bucket_id = 'receitas' and public.is_admin());

create policy "admin envia arquivos de receitas" on storage.objects
  for insert to authenticated with check (bucket_id = 'receitas' and public.is_admin());

create policy "admin atualiza arquivos de receitas" on storage.objects
  for update to authenticated using (bucket_id = 'receitas' and public.is_admin());

create policy "admin remove arquivos de receitas" on storage.objects
  for delete to authenticated using (bucket_id = 'receitas' and public.is_admin());
