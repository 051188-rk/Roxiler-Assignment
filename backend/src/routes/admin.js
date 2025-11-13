import { Router } from 'express';
import { pool } from '../db.js';
import { authenticateJWT, requireRole } from '../middleware/auth.js';
import { nameRules, emailRules, addressRules, passwordRules, optionalFilterRules, optionalSortRules } from '../utils/validators.js';
import { handleValidation } from '../middleware/validate.js';
import bcrypt from 'bcryptjs';
import { buildFilterAndSort } from '../utils/sql.js';

const router = Router();
router.use(authenticateJWT, requireRole('admin'));

/**
 * Dashboard: total users, stores, ratings
 */
router.get('/dashboard', async (_req, res) => {
  try {
    const [{ rows: u }, { rows: s }, { rows: r }] = await Promise.all([
      pool.query('select count(*)::int as total_users from users'),
      pool.query('select count(*)::int as total_stores from stores'),
      pool.query('select count(*)::int as total_ratings from ratings')
    ]);
    return res.json({ totalUsers: u[0].total_users, totalStores: s[0].total_stores, totalRatings: r[0].total_ratings });
  } catch {
    return res.status(500).json({ message: 'Server error' });
  }
});

/**
 * Add user (admin can add admin/user/owner).
 */
router.post('/users', [nameRules, emailRules, addressRules, passwordRules, handleValidation], async (req, res) => {
  const { name, email, address, password, role = 'user' } = req.body;
  if (!['admin','user','owner'].includes(role)) return res.status(400).json({ message: 'Invalid role' });
  try {
    const { rows: existing } = await pool.query('select id from users where email=$1', [email]);
    if (existing.length) return res.status(409).json({ message: 'Email already exists' });
    const hash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      'insert into users (name,email,password_hash,address,role) values ($1,$2,$3,$4,$5) returning id,name,email,address,role,created_at',
      [name, email, hash, address, role]
    );
    return res.status(201).json(rows[0]);
  } catch {
    return res.status(500).json({ message: 'Server error' });
  }
});

/**
 * List users with filters and sorting.
 */
router.get('/users', optionalFilterRules.concat(optionalSortRules).concat([handleValidation]), async (req, res) => {
  const { name, email, address, role, sortBy, sortOrder } = req.query;
  const { whereSql, orderSql, values } = buildFilterAndSort({
    filters: { name, email, address, role },
    sortBy,
    sortOrder,
    allowedSort: ['name','email','address','role','created_at']
  });
  const sql = `
    select id, name, email, address, role, created_at
    from users
    ${whereSql}
    ${orderSql}
  `;
  try {
    const { rows } = await pool.query(sql, values);
    return res.json(rows);
  } catch {
    return res.status(500).json({ message: 'Server error' });
  }
});

/**
 * User details, include owner average rating if role=owner.
 */
router.get('/users/:id', async (req, res) => {
  try {
    const { rows } = await pool.query('select id,name,email,address,role,created_at from users where id=$1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Not found' });
    const user = rows[0];
    if (user.role === 'owner') {
      const { rows: avg } = await pool.query(`
        select coalesce(avg(r.rating),0)::numeric(10,2) as owner_avg_rating
        from stores s left join ratings r on r.store_id = s.id
        where s.owner_user_id=$1
      `, [user.id]);
      user.owner_avg_rating = avg[0].owner_avg_rating;
    }
    return res.json(user);
  } catch {
    return res.status(500).json({ message: 'Server error' });
  }
});

/**
 * List stores with rating, filters, sorting.
 */
router.get('/stores', optionalFilterRules.concat(optionalSortRules).concat([handleValidation]), async (req, res) => {
  const { name, email, address, sortBy, sortOrder } = req.query;
  const { whereSql, orderSql, values } = (() => {
    const where = [];
    const vals = [];
    let idx = 1;
    if (name) { where.push(`LOWER(s.name) like LOWER('%' || $${idx++} || '%')`); vals.push(name); }
    if (email) { where.push(`LOWER(s.email) like LOWER('%' || $${idx++} || '%')`); vals.push(email); }
    if (address) { where.push(`LOWER(s.address) like LOWER('%' || $${idx++} || '%')`); vals.push(address); }
    const ws = where.length ? `where ${where.join(' and ')}` : '';
    let os = '';
    const allowed = ['name','email','address','rating','created_at'];
    if (sortBy && allowed.includes(sortBy)) {
      const dir = sortOrder?.toLowerCase() === 'desc' ? 'desc' : 'asc';
      if (sortBy === 'rating') {
        os = `order by coalesce(sar.avg_rating,0) ${dir}`;
      } else {
        os = `order by s.${sortBy} ${dir}`;
      }
    }
    return { whereSql: ws, orderSql: os, values: vals };
  })();

  const sql = `
    select
      s.id, s.name, s.email, s.address,
      coalesce(sar.avg_rating,0)::numeric(10,2) as rating,
      coalesce(sar.rating_count,0)::int as rating_count
    from stores s
    left join store_avg_rating sar on sar.store_id = s.id
    ${whereSql}
    ${orderSql}
  `;
  try {
    const { rows } = await pool.query(sql, values);
    return res.json(rows);
  } catch {
    return res.status(500).json({ message: 'Server error' });
  }
});

/**
 * Add store.
 */
router.post('/stores', [
  (req, res, next) => {
    if (!req.body.name || typeof req.body.name !== 'string' || req.body.name.length < 1) {
      return res.status(422).json({ message: 'Store name required' });
    }
    next();
  },
  (req, res, next) => {
    const addr = req.body.address;
    if (!addr || typeof addr !== 'string' || addr.length > 400) {
      return res.status(422).json({ message: 'Address max 400 chars' });
    }
    next();
  }
], async (req, res) => {
  const { name, email, address, owner_user_id } = req.body;
  try {
    let ownerId = owner_user_id || null;
    if (ownerId) {
      const { rows: ow } = await pool.query('select id from users where id=$1 and role=$2', [ownerId, 'owner']);
      if (!ow.length) return res.status(400).json({ message: 'Invalid owner_user_id' });
    }
    const { rows } = await pool.query(
      'insert into stores (name,email,address,owner_user_id) values ($1,$2,$3,$4) returning *',
      [name, email || null, address, ownerId]
    );
    return res.status(201).json(rows[0]);
  } catch {
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router;
