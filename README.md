# Zé Catira — classificados

Site de classificados em Next.js 15 (App Router) com Supabase (banco, login e fotos).

## O que já está pronto

- Lista de anúncios publicados (`/`)
- Página do anúncio com fotos e botão de WhatsApp (`/anuncio/[id]`)
- Login sem senha, por link no e-mail (`/entrar`)
- Publicar anúncio com upload de fotos (`/publicar`) — entra como **pendente**
- Meus anúncios, com o status de cada um (`/meus-anuncios`)
- Row Level Security: visitante só lê anúncio `publicado`; cada pessoa só mexe no que é seu
- Fotos no bucket público `fotos`, cada usuário gravando apenas em `fotos/{user_id}/...`

## Rodar na sua máquina

```bash
npm install
npm run dev
```

Abre em http://localhost:3000. As variáveis já estão em `.env.local`.

## Publicar na Vercel

1. Crie um repositório no GitHub e suba esta pasta.
2. Em vercel.com → **Add New → Project** → importe o repositório.
3. Em **Environment Variables**, cadastre as duas linhas do arquivo `.env.example`
   (`NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_KEY`).
4. Deploy. Você recebe uma URL `.vercel.app` já funcionando.

## Ligar o domínio zecatira.com.br

1. Na Vercel: **Settings → Domains → Add Domain** → `zecatira.com.br` (aceite incluir o `www`).
2. A Vercel mostra os valores exatos: um registro **A** para o domínio raiz e um **CNAME**
   para o `www` (o CNAME é específico do seu projeto — use o que aparecer na tela).
3. No Registro.br: **Painel → seu domínio → Editar Zona (DNS)** → crie os dois registros.
4. Propaga em minutos; a Vercel emite o certificado HTTPS sozinha.

## Depois de ter a URL de produção

No painel do Supabase → **Authentication → URL Configuration**:

- **Site URL**: `https://www.zecatira.com.br`
- **Redirect URLs**: adicione `https://www.zecatira.com.br/auth/callback`
  e `http://localhost:3000/auth/callback`

Sem isso o link de acesso do e-mail volta para o endereço errado.

## Moderação

Todo anúncio nasce com `status = 'pendente'` e não aparece no site. Para aprovar, hoje:
Supabase → **Table Editor → anuncios** → mude o `status` para `publicado`.
Uma tela de administração é o próximo passo natural.

## Migrações

`supabase/migrations/` guarda o SQL que já foi aplicado no projeto. Se um dia você ligar a
integração GitHub↔Supabase, é daqui que ela vai ler o schema.
