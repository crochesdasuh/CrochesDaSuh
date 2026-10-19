-- Ateliê da Suh — estrutura inicial do banco (Supabase / Postgres)
-- Rode no SQL Editor do Supabase (ou `supabase db push`).

-- =========================================================================
-- Administradores
-- =========================================================================
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

grant execute on function public.is_admin() to anon, authenticated;

create policy "admins leem a própria linha" on public.admins
  for select to authenticated using (user_id = auth.uid());

-- =========================================================================
-- Produtos
-- =========================================================================
create table if not exists public.products (
  id text primary key check (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null check (char_length(name) between 2 and 120),
  short_description text not null default '',
  description text not null default '',
  image_url text not null,
  image_alt text not null default '',
  categories text[] not null default '{}'
    check (categories <@ array['mesa', 'banheiro', 'bolsas', 'infantil', 'pronta-entrega']),
  price_from numeric(10, 2) not null default 0 check (price_from >= 0),
  -- null = pronta entrega; número = dias de confecção
  lead_time_days integer check (lead_time_days is null or lead_time_days between 1 and 120),
  badges text[] not null default '{}'
    check (badges <@ array['Mais Pedido', 'Pronta Entrega', 'Novidade', 'Feito sob Medida']),
  details text[] not null default '{}',
  quantity_label text not null default 'Quantidade',
  quantity_unit text not null default 'unidade(s)',
  quantity_options integer[] not null default '{1,2,3}'
    check (cardinality(quantity_options) between 1 and 8),
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_sort_idx on public.products (sort_order, created_at);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists products_touch on public.products;
create trigger products_touch before update on public.products
  for each row execute function public.touch_updated_at();

alter table public.products enable row level security;

create policy "todos veem produtos ativos" on public.products
  for select to anon, authenticated using (active or public.is_admin());

create policy "admin cadastra produtos" on public.products
  for insert to authenticated with check (public.is_admin());

create policy "admin edita produtos" on public.products
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "admin remove produtos" on public.products
  for delete to authenticated using (public.is_admin());

-- =========================================================================
-- Eventos de métricas (anônimos: sem IP, sem dados pessoais)
-- =========================================================================
create table if not exists public.events (
  id bigint generated always as identity primary key,
  type text not null check (type in ('page_view', 'product_view', 'whatsapp_click')),
  product_id text references public.products (id) on delete set null,
  palette text check (char_length(palette) <= 60),
  quantity integer check (quantity between 1 and 999),
  session_id text check (char_length(session_id) <= 64),
  referrer text check (char_length(referrer) <= 120),
  device text check (device in ('mobile', 'desktop')),
  created_at timestamptz not null default now()
);

create index if not exists events_created_idx on public.events (created_at);
create index if not exists events_type_created_idx on public.events (type, created_at);

alter table public.events enable row level security;

-- O site (anônimo) só pode registrar eventos; ler é exclusivo do admin.
create policy "site registra eventos" on public.events
  for insert to anon, authenticated with check (created_at > now() - interval '1 minute');

create policy "admin lê eventos" on public.events
  for select to authenticated using (public.is_admin());

-- =========================================================================
-- Métricas agregadas para o painel
-- =========================================================================
create or replace function public.admin_metrics(days integer default 30)
returns jsonb
language plpgsql
stable
security invoker
set search_path = ''
-- Dias contados no horário de Brasília, não em UTC.
set timezone = 'America/Sao_Paulo'
as $$
declare
  since timestamptz := date_trunc('day', now()) - make_interval(days => greatest(days, 1) - 1);
  result jsonb;
begin
  if not public.is_admin() then
    raise exception 'acesso negado' using errcode = '42501';
  end if;

  with ev as (
    select * from public.events where created_at >= since
  ),
  totals as (
    select
      count(*) filter (where type = 'page_view') as page_views,
      count(distinct session_id) filter (where type = 'page_view') as visitors,
      count(*) filter (where type = 'product_view') as product_views,
      count(*) filter (where type = 'whatsapp_click') as whatsapp_clicks
    from ev
  ),
  daily as (
    select
      d::date as day,
      count(e.*) filter (where e.type = 'page_view') as page_views,
      count(e.*) filter (where e.type = 'product_view') as product_views,
      count(e.*) filter (where e.type = 'whatsapp_click') as whatsapp_clicks
    from generate_series(since, date_trunc('day', now()), interval '1 day') d
    left join ev e on date_trunc('day', e.created_at) = d
    group by d
    order by d
  ),
  by_product as (
    select
      p.id,
      p.name,
      count(e.*) filter (where e.type = 'product_view') as views,
      count(e.*) filter (where e.type = 'whatsapp_click') as clicks
    from public.products p
    left join ev e on e.product_id = p.id
    group by p.id, p.name
  ),
  palettes as (
    select palette, count(*) as total
    from ev
    where type = 'whatsapp_click' and palette is not null
    group by palette
  ),
  referrers as (
    select coalesce(nullif(referrer, ''), 'direto') as source, count(*) as total
    from ev
    where type = 'page_view'
    group by 1
  ),
  devices as (
    select coalesce(device, 'desktop') as device, count(*) as total
    from ev
    where type = 'page_view'
    group by 1
  )
  select jsonb_build_object(
    'since', since,
    'totals', (select to_jsonb(totals) from totals),
    'daily', coalesce((select jsonb_agg(to_jsonb(daily)) from daily), '[]'),
    'products', coalesce(
      (select jsonb_agg(to_jsonb(b) order by b.clicks desc, b.views desc) from by_product b),
      '[]'
    ),
    'palettes', coalesce(
      (select jsonb_agg(to_jsonb(p) order by p.total desc) from palettes p),
      '[]'
    ),
    'referrers', coalesce(
      (select jsonb_agg(to_jsonb(r) order by r.total desc) from referrers r),
      '[]'
    ),
    'devices', coalesce((select jsonb_agg(to_jsonb(d)) from devices d), '[]')
  ) into result;

  return result;
end;
$$;

grant execute on function public.admin_metrics(integer) to authenticated;

-- =========================================================================
-- Fotos dos produtos (Storage)
-- =========================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('produtos', 'produtos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

-- Leitura pública é feita pela URL pública do bucket; o SELECT abaixo é
-- necessário para o upload/upsert retornar a linha criada.
create policy "admin lista fotos" on storage.objects
  for select to authenticated using (bucket_id = 'produtos' and public.is_admin());

create policy "admin envia fotos" on storage.objects
  for insert to authenticated with check (bucket_id = 'produtos' and public.is_admin());

create policy "admin atualiza fotos" on storage.objects
  for update to authenticated using (bucket_id = 'produtos' and public.is_admin());

create policy "admin remove fotos" on storage.objects
  for delete to authenticated using (bucket_id = 'produtos' and public.is_admin());
