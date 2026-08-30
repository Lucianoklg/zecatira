-- Ze Catira: esquema inicial (ja aplicado no projeto zecatira)
create extension if not exists pgcrypto;

create table if not exists public.perfis (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text,
  telefone text,
  cidade text,
  uf text,
  criado_em timestamptz not null default now()
);

create table if not exists public.anuncios (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  titulo text not null,
  descricao text,
  preco numeric(12,2),
  categoria text,
  cidade text,
  uf text,
  contato_whatsapp text,
  status text not null default 'rascunho',
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

alter table public.anuncios drop constraint if exists anuncios_status_check;
alter table public.anuncios add constraint anuncios_status_check
  check (status in ('rascunho','pendente','publicado','vendido','recusado'));

create index if not exists anuncios_status_idx on public.anuncios (status, criado_em desc);
create index if not exists anuncios_user_idx on public.anuncios (user_id);

create table if not exists public.anuncio_fotos (
  id uuid primary key default gen_random_uuid(),
  anuncio_id uuid not null references public.anuncios(id) on delete cascade,
  path text not null,
  ordem int not null default 0,
  criado_em timestamptz not null default now()
);

create index if not exists anuncio_fotos_idx on public.anuncio_fotos (anuncio_id, ordem);

alter table public.perfis enable row level security;
alter table public.anuncios enable row level security;
alter table public.anuncio_fotos enable row level security;

drop policy if exists perfis_dono_select on public.perfis;
create policy perfis_dono_select on public.perfis for select using (auth.uid() = id);
drop policy if exists perfis_dono_insert on public.perfis;
create policy perfis_dono_insert on public.perfis for insert with check (auth.uid() = id);
drop policy if exists perfis_dono_update on public.perfis;
create policy perfis_dono_update on public.perfis for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists anuncios_publico_select on public.anuncios;
create policy anuncios_publico_select on public.anuncios for select using (status = 'publicado');
drop policy if exists anuncios_dono_select on public.anuncios;
create policy anuncios_dono_select on public.anuncios for select using (auth.uid() = user_id);
drop policy if exists anuncios_dono_insert on public.anuncios;
create policy anuncios_dono_insert on public.anuncios for insert with check (auth.uid() = user_id);
drop policy if exists anuncios_dono_update on public.anuncios;
create policy anuncios_dono_update on public.anuncios for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists anuncios_dono_delete on public.anuncios;
create policy anuncios_dono_delete on public.anuncios for delete using (auth.uid() = user_id);

drop policy if exists fotos_select on public.anuncio_fotos;
create policy fotos_select on public.anuncio_fotos for select using (
  exists (select 1 from public.anuncios a where a.id = anuncio_id and (a.status = 'publicado' or a.user_id = auth.uid()))
);
drop policy if exists fotos_dono_insert on public.anuncio_fotos;
create policy fotos_dono_insert on public.anuncio_fotos for insert with check (
  exists (select 1 from public.anuncios a where a.id = anuncio_id and a.user_id = auth.uid())
);
drop policy if exists fotos_dono_update on public.anuncio_fotos;
create policy fotos_dono_update on public.anuncio_fotos for update using (
  exists (select 1 from public.anuncios a where a.id = anuncio_id and a.user_id = auth.uid())
) with check (
  exists (select 1 from public.anuncios a where a.id = anuncio_id and a.user_id = auth.uid())
);
drop policy if exists fotos_dono_delete on public.anuncio_fotos;
create policy fotos_dono_delete on public.anuncio_fotos for delete using (
  exists (select 1 from public.anuncios a where a.id = anuncio_id and a.user_id = auth.uid())
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.perfis (id) values (new.id) on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.set_atualizado_em()
returns trigger language plpgsql as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$;

drop trigger if exists anuncios_set_atualizado_em on public.anuncios;
create trigger anuncios_set_atualizado_em before update on public.anuncios
for each row execute function public.set_atualizado_em();
