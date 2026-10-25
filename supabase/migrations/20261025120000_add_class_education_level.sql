-- Store each class's grade level so it is the same on every device.
-- The app already reads and writes education_level; without the column it was only kept in the backend store.
alter table public.classes add column if not exists education_level text;
