-- admin
insert into users (name,email,password_hash,address,role)
values ('System Administrator Example Name','admin@example.com',
  '$2a$10$8x2Zeu7GQm2y0Q9xI7VJdOQfW5M0kKfC8c9Wm5XrTOkRtP0cTLa0K', -- bcrypt hash of Admin@123!
  'Admin Address, City','admin')
on conflict do nothing;

-- owner
insert into users (name,email,password_hash,address,role)
values ('Store Owner Example Name Here','owner@example.com',
  '$2a$10$8x2Zeu7GQm2y0Q9xI7VJdOQfW5M0kKfC8c9Wm5XrTOkRtP0cTLa0K', -- Admin@123!
  'Owner Address, City','owner')
on conflict do nothing;

-- user
insert into users (name,email,password_hash,address,role)
values ('Normal User Example Full Name','user@example.com',
  '$2a$10$8x2Zeu7GQm2y0Q9xI7VJdOQfW5M0kKfC8c9Wm5XrTOkRtP0cTLa0K', -- Admin@123!
  'User Address, City','user')
on conflict do nothing;

-- a store owned by owner
insert into stores (name,email,address,owner_user_id)
select 'Sample Store One','store1@example.com','Sample Store Address', u.id
from users u where u.email='owner@example.com'
on conflict do nothing;
