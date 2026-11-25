create table if not exists public.lessons (
  id text primary key,
  slug text not null unique,
  title text not null default '',
  title_en text,
  ambassador_level text
    check (ambassador_level in ('A1', 'A2', 'B1', 'FieldLab', 'LocalAgri')),
  topic_tag text not null default '',
  topic_tag_en text,
  duration_label text not null default '',
  duration_label_en text,
  level_label text not null default '',
  level_label_en text,
  region_code text not null default '',
  region_name text not null default '',
  summary text not null default '',
  summary_en text,
  learning_objective_en text,
  image text not null default '',
  anatomy_target text not null default ''
    check (anatomy_target in (
      'pomelo', 'rambutan', 'cashew', 'durian',
      'coffee', 'pepper', 'cacao', 'avocado', 'honey'
    )),
  sections jsonb not null default '[]',
  quiz_question jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.school_classes (
  id text primary key,
  name text not null default '',
  school_name text not null default '',
  teacher_name text not null default '',
  lesson_ids text[] not null default '{}',
  enrolled_count integer not null default 0,
  minor_consent_count integer not null default 0,
  field_trip_date text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.student_submissions (
  id text primary key,
  class_id text references public.school_classes(id) on delete set null,
  student_name text not null default '',
  is_minor boolean not null default false,
  has_guardian_consent boolean not null default false,
  title text not null default '',
  rubric_score numeric,
  status text not null default 'submitted'
    check (status in ('submitted', 'graded')),
  user_id uuid references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.lessons enable row level security;
alter table public.school_classes enable row level security;
alter table public.student_submissions enable row level security;

create policy lessons_select on public.lessons for select using (true);
create policy lessons_write on public.lessons for all
  using (public.is_admin())
  with check (public.is_admin());

create policy school_classes_select on public.school_classes for select using (true);
create policy school_classes_write on public.school_classes for all
  using (public.is_admin())
  with check (public.is_admin());

create policy student_submissions_select on public.student_submissions for select using (true);
create policy student_submissions_write on public.student_submissions for all
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

grant select on public.lessons, public.school_classes, public.student_submissions to anon, authenticated;
grant insert, update, delete on public.lessons, public.school_classes, public.student_submissions to authenticated;
