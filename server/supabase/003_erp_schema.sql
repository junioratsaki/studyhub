-- =====================================================================
-- STUDYHUB IUC - 003_ERP_SCHEMA.SQL
-- Extension ERP : Campus, Écoles, Niveaux et Matricules
-- =====================================================================

-- 1. Nouvelles Tables de Référentiel
create table if not exists public.campus (
    id uuid primary key default gen_random_uuid(),
    nom text not null unique,
    created_at timestamptz default now() not null
);

create table if not exists public.ecoles (
    id uuid primary key default gen_random_uuid(),
    nom text not null unique,
    campus_id uuid references public.campus(id) on delete cascade,
    created_at timestamptz default now() not null
);

create table if not exists public.niveaux (
    id uuid primary key default gen_random_uuid(),
    nom text not null unique,
    created_at timestamptz default now() not null
);

-- 2. Mise à jour de la table FILIERES
alter table public.filieres add column if not exists ecole_id uuid references public.ecoles(id) on delete set null;
alter table public.filieres add column if not exists niveau_id uuid references public.niveaux(id) on delete set null;

-- 3. Mise à jour de la table USERS
-- Ajout du matricule (unique)
alter table public.users add column if not exists matricule text unique;

-- 4. Activer RLS sur les nouvelles tables
alter table public.campus enable row level security;
alter table public.ecoles enable row level security;
alter table public.niveaux enable row level security;

-- 5. Politiques RLS (Lecture publique pour les authentifiés)
create policy "Campus: select for all" on public.campus for select using (true);
create policy "Campus: admin full access" on public.campus for all using (auth.jwt() ->> 'role' = 'ADMIN');

create policy "Ecoles: select for all" on public.ecoles for select using (true);
create policy "Ecoles: admin full access" on public.ecoles for all using (auth.jwt() ->> 'role' = 'ADMIN');

create policy "Niveaux: select for all" on public.niveaux for select using (true);
create policy "Niveaux: admin full access" on public.niveaux for all using (auth.jwt() ->> 'role' = 'ADMIN');

-- 6. SEEDING INITIAL (Données IUC)
insert into public.campus (nom) values 
('Logbessou'), 
('Akwa'), 
('Yassa')
on conflict (nom) do nothing;

insert into public.niveaux (nom) values 
('BTS'), 
('Licence Professionnelle'), 
('Cycle Ingénieur'), 
('Master Professionnel')
on conflict (nom) do nothing;
