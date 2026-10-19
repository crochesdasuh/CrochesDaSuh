-- Ateliê da Suh — calculadora de preço das peças (só o admin vê e edita).
-- Rode no SQL Editor do Supabase depois da 0001.

create table if not exists public.price_calculations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  product_id text references public.products (id) on delete set null,
  -- Entradas da calculadora (linhas, outros materiais, horas, valor da hora, lucro, taxa).
  input jsonb not null,
  -- Resultado no momento em que foi salvo, para listar sem recalcular.
  material_cost numeric(10, 2) not null default 0,
  labor_cost numeric(10, 2) not null default 0,
  total_hours numeric(6, 2) not null default 0,
  price numeric(10, 2) not null default 0,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists price_calculations_updated_idx
  on public.price_calculations (updated_at desc);

drop trigger if exists price_calculations_touch on public.price_calculations;
create trigger price_calculations_touch before update on public.price_calculations
  for each row execute function public.touch_updated_at();

alter table public.price_calculations enable row level security;

create policy "admin gerencia cálculos" on public.price_calculations
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
