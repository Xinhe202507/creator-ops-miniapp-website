create table if not exists public.creator_ops_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null check (role in ('admin', 'operator', 'readonly')),
  owner_name text default '',
  created_at timestamptz not null default now()
);

create table if not exists public.creator_ops_state (
  key text primary key,
  value jsonb not null default '[]'::jsonb,
  updated_by uuid references auth.users(id),
  updated_at timestamptz not null default now()
);

alter table public.creator_ops_users enable row level security;
alter table public.creator_ops_state enable row level security;

create policy "creator_ops_users_read_own_or_admin"
on public.creator_ops_users
for select
to authenticated
using (
  user_id = auth.uid()
  or exists (
    select 1 from public.creator_ops_users u
    where u.user_id = auth.uid() and u.role = 'admin'
  )
);

create policy "creator_ops_state_read_authenticated"
on public.creator_ops_state
for select
to authenticated
using (true);

create policy "creator_ops_state_write_admin_operator"
on public.creator_ops_state
for all
to authenticated
using (
  exists (
    select 1 from public.creator_ops_users u
    where u.user_id = auth.uid() and u.role in ('admin', 'operator')
  )
)
with check (
  exists (
    select 1 from public.creator_ops_users u
    where u.user_id = auth.uid() and u.role in ('admin', 'operator')
  )
);

-- 使用方法：
-- 1. 在 Supabase Authentication 里创建用户。
-- 2. 复制 auth.users.id。
-- 3. 给每个用户插入角色，例如：
-- insert into public.creator_ops_users (user_id, email, role, owner_name)
-- values
-- ('用户UUID', 'boss@company.com', 'admin', '老板'),
-- ('用户UUID', 'ana@company.com', 'operator', 'Ana'),
-- ('用户UUID', 'viewer@company.com', 'readonly', '只读');
