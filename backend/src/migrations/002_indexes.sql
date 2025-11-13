create index if not exists idx_users_email on users(email);
create index if not exists idx_users_role on users(role);
create index if not exists idx_stores_name on stores(name);
create index if not exists idx_stores_address on stores(address);
create index if not exists idx_ratings_store on ratings(store_id);
create index if not exists idx_ratings_user on ratings(user_id);
