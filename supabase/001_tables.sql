-- =====================================================================
-- STUDYHUB IUC - 001_TABLES.SQL
-- Création des types et des tables de base
-- =====================================================================

-- 1. Création des ENUMS
do $$ begin
    create type role_enum as enum ('ETUDIANT', 'ENSEIGNANT', 'ADMIN');
    create type subject_status as enum ('EN_ATTENTE', 'PUBLIE', 'REJETE');
    create type correction_status as enum ('BROUILLON', 'PUBLIE', 'REJETE');
    create type correction_source as enum ('OFFICIELLE', 'IA_GENEREE');
    create type type_examen as enum ('NORMAL', 'RATTRAPAGE', 'CC', 'TP');
exception
    when duplicate_object then null;
end $$;

-- 2. Table FILIERES
create table if not exists public.filieres (
    id uuid primary key default gen_random_uuid(),
    nom text not null,
    ecole text,
    niveau text,
    created_at timestamptz default now() not null
);

-- 3. Table USERS
create table if not exists public.users (
    id uuid primary key default gen_random_uuid(),
    nom text,
    email text unique not null,
    password_hash text not null,
    role role_enum default 'ETUDIANT',
    filiere_id uuid references public.filieres(id) on delete set null,
    avatar_url text,
    is_active boolean default true,
    created_at timestamptz default now() not null
);

-- 4. Table ACCREDITATION_CODES
create table if not exists public.accreditation_codes (
    id uuid primary key default gen_random_uuid(),
    code text unique not null,
    created_by uuid references public.users(id) on delete set null,
    used boolean default false,
    expires_at timestamptz not null,
    created_at timestamptz default now() not null
);

-- 5. Table MATIERES
create table if not exists public.matieres (
    id uuid primary key default gen_random_uuid(),
    nom text not null,
    filiere_id uuid references public.filieres(id) on delete cascade,
    created_at timestamptz default now() not null
);

-- 6. Table SUBJECTS
create table if not exists public.subjects (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    description text,
    file_url text not null,
    storage_path text not null,
    filiere_id uuid references public.filieres(id) on delete set null,
    matiere_id uuid references public.matieres(id) on delete set null,
    annee integer not null,
    type_examen type_examen default 'NORMAL',
    author_id uuid references public.users(id) on delete set null,
    status subject_status default 'EN_ATTENTE',
    nombre_vues integer default 0,
    scan_report_id uuid,
    created_at timestamptz default now() not null
);

-- 7. Table CORRECTIONS
create table if not exists public.corrections (
    id uuid primary key default gen_random_uuid(),
    subject_id uuid references public.subjects(id) on delete cascade not null,
    author_id uuid references public.users(id) on delete set null,
    content text,
    file_url text,
    source correction_source default 'IA_GENEREE',
    status correction_status default 'BROUILLON',
    created_at timestamptz default now() not null
);

-- 8. Table AI_SCAN_REPORTS
create table if not exists public.ai_scan_reports (
    id uuid primary key default gen_random_uuid(),
    subject_id uuid references public.subjects(id) on delete cascade,
    score_coherence integer,
    is_duplicate boolean default false,
    commentaires jsonb,
    passed boolean default false,
    created_at timestamptz default now() not null
);

-- 9. Table AI_SESSIONS
create table if not exists public.ai_sessions (
    id uuid primary key default gen_random_uuid(),
    subject_id uuid references public.subjects(id) on delete cascade,
    user_id uuid references public.users(id) on delete cascade,
    messages jsonb default '[]'::jsonb,
    created_at timestamptz default now() not null
);

-- 10. Table READING_HISTORY
create table if not exists public.reading_history (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references public.users(id) on delete cascade,
    subject_id uuid references public.subjects(id) on delete cascade,
    last_read_at timestamptz default now() not null,
    unique(user_id, subject_id)
);

-- 11. Table FAVORITES
create table if not exists public.favorites (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references public.users(id) on delete cascade,
    subject_id uuid references public.subjects(id) on delete cascade,
    created_at timestamptz default now() not null,
    unique(user_id, subject_id)
);

-- 12. Table ANNOUNCEMENTS
create table if not exists public.announcements (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    content text not null,
    type text check (type in ('info', 'warning', 'success', 'urgent')),
    created_by uuid references public.users(id) on delete set null,
    is_active boolean default true,
    created_at timestamptz default now() not null
);

-- 13. Table AUDIT_LOGS
create table if not exists public.audit_logs (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references public.users(id) on delete set null,
    action text not null,
    details jsonb,
    level text default 'INFO',
    ip text,
    created_at timestamptz default now() not null
);

-- INDEXES pour la performance
create index if not exists idx_users_email on public.users(email);
create index if not exists idx_subjects_filiere on public.subjects(filiere_id);
create index if not exists idx_subjects_matiere on public.subjects(matiere_id);
create index if not exists idx_subjects_status on public.subjects(status);
