-- Ateliê da Suh — foto do produto passa a ser opcional e as fotos provisórias
-- (banco de imagens, em /images/...) são desvinculadas dos produtos.
-- Rode no SQL Editor do Supabase. Depois envie as fotos reais pelo /admin.

alter table public.products alter column image_url drop not null;

update public.products
set image_url = null,
    image_alt = ''
where image_url like '/images/%';
