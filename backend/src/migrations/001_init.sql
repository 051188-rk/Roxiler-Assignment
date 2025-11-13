-- Roles: 'admin', 'user', 'owner'
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  name varchar(60) not null,
  email varchar(255) not null unique,
  password_hash text not null,
  address varchar(400) not null,
  role varchar(10) not null check (role in ('admin','user','owner')),
  created_at timestamptz not null default now()
);

create table if not exists stores (
  id uuid primary key default gen_random_uuid(),
  name varchar(120) not null,
  email varchar(255),
  address varchar(400) not null,
  owner_user_id uuid references users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists ratings (
  id bigserial primary key,
  user_id uuid not null references users(id) on delete cascade,
  store_id uuid not null references stores(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, store_id)
);

-- Useful view for store average rating
create or replace view store_avg_rating as
select
  s.id as store_id,
  avg(r.rating)::numeric(10,2) as avg_rating,
  count(r.id) as rating_count
from stores s
left join ratings r on r.store_id = s.id
group by s.id;
