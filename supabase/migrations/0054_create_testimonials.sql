-- Testimonials table to power dynamic reviews on the marketing site
create table if not exists public.testimonials (
    id uuid primary key default gen_random_uuid(),
    reviewer_name text not null check (char_length(reviewer_name) between 1 and 150),
    reviewer_title text,
    content text not null check (char_length(content) between 1 and 2000),
    image_url text not null,
    is_published boolean not null default true,
    updated_by uuid references public.profiles(id),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists testimonials_published_idx
    on public.testimonials (is_published, created_at desc);

alter table public.testimonials enable row level security;

-- Public / anonymous users can only see published testimonials
drop policy if exists "Public can read published testimonials" on public.testimonials;
create policy "Public can read published testimonials" on public.testimonials
    for select
    to anon, authenticated
    using (is_published is true);

-- Staff with update:setting permission can manage testimonials
drop policy if exists "Staff can manage testimonials" on public.testimonials;
create policy "Staff can manage testimonials" on public.testimonials
    for all
    to authenticated
    using (public.user_has_permission(auth.uid(), 'update:setting'))
    with check (public.user_has_permission(auth.uid(), 'update:setting'));
