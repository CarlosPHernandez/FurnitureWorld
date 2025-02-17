create table if not exists public.deliveries (
  id text primary key,
  customer text not null,
  address text not null,
  delivery_date date not null,
  time_slot text not null,
  driver text not null,
  items text[] not null,
  status text not null default 'Scheduled',
  coordinates jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.deliveries enable row level security;

-- Create policies
create policy "Enable read access for all users" on public.deliveries
  for select using (true);

create policy "Enable insert access for all users" on public.deliveries
  for insert with check (true);

create policy "Enable update access for all users" on public.deliveries
  for update using (true);

-- Create updated_at trigger
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger deliveries_updated_at
  before update on public.deliveries
  for each row
  execute procedure public.handle_updated_at();
