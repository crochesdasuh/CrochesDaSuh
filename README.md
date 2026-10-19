# Crochês da Suh

Catálogo digital de crochê artesanal (@croches_dasuh) com pedido direto no WhatsApp.
Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 + Lucide React.

```bash
npm install
npm run dev     # http://localhost:3000
npm run build
```

## Onde editar

- **Produtos:** pelo painel `/admin` (com o Supabase configurado). Sem Supabase, o site usa
  o catálogo estático de `src/data/crochets.ts`, que também serve de reserva.
- **WhatsApp, Instagram, paletas de cores, depoimentos e cuidados:** `src/data/crochets.ts`
  - `WHATSAPP_NUMBER` precisa ser o número real (DDI + DDD + número, só dígitos).
- **Página:** `src/app/page.tsx` · **Catálogo/filtros:** `src/components/Catalog.tsx` ·
  **Modal de pedido:** `src/components/ProductModal.tsx`

## Painel `/admin`

- **Métricas** (`/admin`): visitantes, peças abertas, cliques em “Fazer pedido no WhatsApp”,
  conversão, gráficos por dia, peças mais procuradas, cores mais pedidas, origem das visitas
  (Instagram, Google…) e aparelho. Períodos de 7, 30 e 90 dias.
  As métricas são anônimas: sem cookies, sem IP e sem dados pessoais. As visitas de quem
  usa o painel naquele navegador não são contadas.
- **Produtos** (`/admin/produtos`): cadastrar, editar, ocultar/mostrar e excluir peças, com
  upload de foto. A foto é reduzida no navegador (máx. 1600 px, WebP) antes do envio.
  O site é atualizado na hora ao salvar.

Arquivos principais: `src/app/admin/`, `src/components/admin/`, `src/lib/admin.ts`,
`src/lib/products.ts`, `src/proxy.ts` (protege as rotas) e `src/app/api/track/route.ts`
(recebe os eventos de métricas).

## Configurar o Supabase

1. Crie um projeto em [supabase.com](https://supabase.com) (região **São Paulo**).
2. Em **SQL Editor**, rode `supabase/migrations/0001_init.sql` e depois `supabase/seed.sql`
   (o seed cadastra as 7 peças iniciais).
3. Em **Authentication → Sign In / Providers**, desligue **Allow new users to sign up**.
4. Em **Authentication → Users → Add user**, crie o usuário da Suh (e-mail + senha,
   marcando “Auto Confirm User”).
5. Torne esse usuário administrador no **SQL Editor**:
   ```sql
   insert into public.admins (user_id)
   select id from auth.users where email = 'email-da-suh@exemplo.com';
   ```
6. Copie `.env.example` para `.env` e preencha com a URL e a **Publishable key**
   (Project Settings → API Keys).

Segurança: todas as permissões ficam no banco (Row Level Security). Visitantes só leem
produtos ativos e só conseguem *registrar* eventos; ler métricas e alterar produtos/fotos
exige um usuário da tabela `admins`.

## Deploy no Netlify

1. Suba o projeto para um repositório no GitHub.
2. No Netlify: **Add new site → Import an existing project** → escolha o repositório.
   O `netlify.toml` já define build e versão do Node.
3. Em **Site configuration → Environment variables**, adicione
   `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
4. Faça o deploy e teste `/admin`.

## Fotos provisórias (Wikimedia Commons)

`suh.jpg` é a foto real da artesã. As demais abaixo são provisórias.

As imagens em `public/images/` são placeholders de licença livre e exigem atribuição
enquanto estiverem no site. Substitua-as pelas fotos reais antes de publicar.

| Arquivo | Origem | Licença |
| --- | --- | --- |
| bolsa.jpg | [Blue-green meshwork bag](https://commons.wikimedia.org/wiki/File:Blue-green_meshwork_bag_(1091182610).jpg) — Breibeest | CC BY 2.0 |
| cesto.jpg | [Granny square basket.jpg](https://commons.wikimedia.org/wiki/File:Granny_square_basket.jpg) — Valki77 | CC BY-SA 4.0 |
| centro-mesa.jpg | [Crochet doily.JPG](https://commons.wikimedia.org/wiki/File:Crochet_doily.JPG) — רחל1 | CC BY-SA 4.0 |
| tapete.jpg | [RagRug.jpg](https://commons.wikimedia.org/wiki/File:RagRug.jpg) | ver página |
| amigurumi.jpg | [Amigurumi-bear.jpg](https://commons.wikimedia.org/wiki/File:Amigurumi-bear.jpg) | ver página |
| maos.jpg | [Leftie crochet.jpg](https://commons.wikimedia.org/wiki/File:Leftie_crochet.jpg) | ver página |
| jogo-americano.jpg | [Crocheted Table Runner and Placemat Set (DPLA)](https://commons.wikimedia.org/wiki/File:Crocheted_Table_Runner_and_Placemat_Set_Given_to_Anne_Morrow_Lindbergh_-_DPLA_-_00d0cb0ca576e24a1d3779829107a79a_(page_1).jpg) | ver página |
| porta-copos.jpg | [Podkładka pod kubek. Tunisian crochet](https://commons.wikimedia.org/wiki/File:Podk%C5%82adka_pod_kubek._Tunisian_crochet.jpg) | ver página |
