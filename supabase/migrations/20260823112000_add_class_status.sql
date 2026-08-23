alter table public.classes add column status text default 'approved' check (status in ('pending', 'approved', 'rejected'));
