-- =====================================================================
-- STUDYHUB IUC - 002_RLS.SQL
-- Politiques de sécurité Row Level Security (RLS)
-- =====================================================================

-- Activer RLS sur toutes les tables
alter table public.users enable row level security;
alter table public.filieres enable row level security;
alter table public.matieres enable row level security;
alter table public.subjects enable row level security;
alter table public.corrections enable row level security;
alter table public.ai_scan_reports enable row level security;
alter table public.ai_sessions enable row level security;
alter table public.reading_history enable row level security;
alter table public.favorites enable row level security;
alter table public.announcements enable row level security;
alter table public.audit_logs enable row level security;
alter table public.accreditation_codes enable row level security;

-- 1. TABLE USERS
create policy "Users: select own profile" on public.users for select using (auth.uid() = id);
create policy "Users: update own profile" on public.users for update using (auth.uid() = id);
create policy "Users: admin full access" on public.users for all using (
    auth.jwt() -> 'role' = 'ADMIN'
);

-- 2. TABLE FILIERES & MATIERES (Lecture publique pour authentifiés)
create policy "Filières: select for all" on public.filieres for select using (true);
create policy "Matières: select for all" on public.matieres for select using (true);
create policy "Filières/Matières: admin full access" on public.filieres for all using (auth.jwt() -> 'role' = 'ADMIN');
create policy "Matières: admin full access" on public.matieres for all using (auth.jwt() -> 'role' = 'ADMIN');

-- 3. TABLE SUBJECTS
create policy "Subjects: select published" on public.subjects for select 
using (status = 'PUBLIE' or auth.uid() = author_id or auth.jwt() -> 'role' = 'ADMIN');

create policy "Subjects: insert for auth" on public.subjects for insert 
with check (auth.role() = 'authenticated');

create policy "Subjects: delete own or admin" on public.subjects for delete 
using (auth.uid() = author_id or auth.jwt() -> 'role' = 'ADMIN');

-- 4. TABLE CORRECTIONS
create policy "Corrections: select all auth" on public.corrections for select 
using (auth.role() = 'authenticated');

create policy "Corrections: insert teacher/admin" on public.corrections for insert 
with check (auth.jwt() -> 'role' in ('ENSEIGNANT', 'ADMIN'));

create policy "Corrections: update/delete own or admin" on public.corrections for all 
using (auth.uid() = author_id or auth.jwt() -> 'role' = 'ADMIN');

-- 5. TABLE AI_SESSIONS
create policy "AI_Sessions: owner access" on public.ai_sessions for all 
using (auth.uid() = user_id);

-- 6. TABLE READING_HISTORY & FAVORITES
create policy "History: owner access" on public.reading_history for all 
using (auth.uid() = user_id);

create policy "Favorites: owner access" on public.favorites for all 
using (auth.uid() = user_id);

-- 7. TABLE ANNOUNCEMENTS
create policy "Announcements: read active" on public.announcements for select 
using (is_active = true);

create policy "Announcements: admin full access" on public.announcements for all 
using (auth.jwt() -> 'role' = 'ADMIN');

-- 8. TABLE AUDIT_LOGS
create policy "Audit_Logs: admin only" on public.audit_logs for all 
using (auth.jwt() -> 'role' = 'ADMIN');

-- 9. TABLE ACCREDITATION_CODES
create policy "Accreditation: admin only" on public.accreditation_codes for all 
using (auth.jwt() -> 'role' = 'ADMIN');
