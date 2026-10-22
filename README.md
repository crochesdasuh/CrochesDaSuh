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
- **Instagram, paletas de cores, depoimentos e cuidados:** `src/data/crochets.ts`
- **WhatsApp:** variável de ambiente `WHATSAPP_NUMBER` (DDI + DDD + número, só dígitos), no
  `.env` e no Netlify. Ela fica só no servidor: os botões apontam para `/whatsapp`, que monta
  a mensagem e redireciona; o número não aparece no código, no GitHub nem no HTML.
- **Página:** `src/app/page.tsx` · **Catálogo/filtros:** `src/components/Catalog.tsx` ·
  **Modal de pedido:** `src/components/ProductModal.tsx`

## Painel `/admin`

- **Métricas** (`/admin`): visitantes, peças abertas, cliques em “Fazer pedido no WhatsApp”,
  conversão, gráficos por dia, peças mais procuradas, cores mais pedidas, origem das visitas
  (Instagram, Google…) e aparelho. Períodos de 7, 30 e 90 dias.
  As métricas são anônimas: sem cookies, sem IP e sem dados pessoais. As visitas de quem
  está logado no painel não são contadas.
- **Produtos** (`/admin/produtos`): cadastrar, editar, ocultar/mostrar e excluir peças, com
  upload de foto. A foto é reduzida no navegador (máx. 1600 px, WebP) antes do envio.
  O site é atualizado na hora ao salvar.
- **Calculadora** (`/admin/calculadora`): preço justo de cada peça. Para cada linha, informa
  preço e peso do novelo e quanto ele pesava antes e depois da peça (balança de cozinha);
  soma outros materiais, horas × valor da hora, lucro (%) e taxa da maquininha (%).
  Os cálculos ficam salvos e, se vinculados a uma peça, o preço pode ser aplicado no site.
- **Receitas** (`/admin/receitas`): caderno de receitas com busca. Cada receita guarda foto do
  trabalho pronto, links (o vídeo do YouTube toca na própria página), PDFs/gráficos e
  anotações. Os arquivos ficam num bucket **privado** e são abertos por links temporários.

Arquivos principais: `src/app/admin/`, `src/components/admin/`, `src/lib/admin.ts`,
`src/lib/products.ts`, `src/proxy.ts` (protege as rotas) e `src/app/api/track/route.ts`
(recebe os eventos de métricas).

## Configurar o Supabase

1. Crie um projeto em [supabase.com](https://supabase.com) (região **São Paulo**).
2. Em **SQL Editor**, rode na ordem `supabase/migrations/0001_init.sql`, `0002_calculadora.sql`,
   `0003_receitas.sql`, `0004_fotos_opcionais.sql` e por fim `supabase/seed.sql`
   (o seed cadastra as 7 peças iniciais, sem foto).
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

## Segurança e privacidade

- **Permissões no banco (Row Level Security):** visitantes só leem produtos ativos e só
  *registram* eventos. Métricas, cálculos, receitas e alterações exigem um usuário da
  tabela `admins`.
- **Login:** o cookie de sessão é `HttpOnly` (scripts da página não conseguem ler o token),
  `Secure`, `SameSite=Lax` e expira após **12 horas sem uso** (`src/lib/supabase/cookies.ts`).
- **Nada do painel fica no navegador:** sem `localStorage`/`sessionStorage`; o navegador não
  usa a sessão do Supabase. Envios de fotos e PDFs usam um ingresso de uso único gerado no
  servidor (`src/lib/upload.ts`).
- **Receitas privadas:** bucket privado. A página só recebe `/admin/arquivo/<arquivo>`, que
  confere o login a cada acesso e redireciona para um link que expira em **60 segundos**.
- **Sair** (`/admin/sair`): encerra a sessão e envia `Clear-Site-Data` (apaga cache, cookies
  e armazenamento do site no navegador).
- **Cabeçalhos** (`next.config.ts`): Content-Security-Policy, `X-Frame-Options: DENY`,
  `nosniff`, `Permissions-Policy`, HSTS; no `/admin`, `Cache-Control: no-store`,
  `Referrer-Policy: no-referrer` e `noindex`.
- O site público guarda só um identificador anônimo de visita no `sessionStorage`
  (apagado ao fechar a aba), usado para contar visitantes únicos.

## Deploy no Netlify

1. Suba o projeto para um repositório no GitHub.
2. No Netlify: **Add new site → Import an existing project** → escolha o repositório.
   O `netlify.toml` já define build e versão do Node.
3. Em **Project configuration → Environment variables**, adicione
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` e `WHATSAPP_NUMBER`.
4. Faça o deploy e teste `/admin`.

## Fotos

As fotos das peças são enviadas pelo painel (`/admin/produtos`) e ficam no Supabase. Peça sem
foto aparece no site com um quadro “foto em breve”. A capa mostra as 3 primeiras peças que já
têm foto. `public/images/suh.jpg` é a foto da artesã (seção “Sobre”).
