import { Router } from 'express';
import { pool } from '../db.js';
import { authenticateJWT, requireRole } from '../middleware/auth.js';
import { ratingRules } from '../utils/validators.js';
import { handleValidation } from '../middleware/validate.js';

const router = Router();

/**
 * List stores for public or authenticated users, include overall avg and current user's rating if logged in.
 */
router.get('/', authenticateJWT, async (req, res) => {
  const userId = req.user?.id;
  const { q, name, address, sortBy, sortOrder } = req.query;

  const filters = [];
  const values = [];
  let idx = 1;

  if (q) {
    filters.push(`(LOWER(s.name) like LOWER('%' || $${idx} || '%') or LOWER(s.address) like LOWER('%' || $${idx} || '%'))`);
    values.push(q);
    idx++;
  }
  if (name) { filters.push(`LOWER(s.name) like LOWER('%' || $${idx++} || '%')`); values.push(name); }
  if (address) { filters.push(`LOWER(s.address) like LOWER('%' || $${idx++} || '%')`); values.push(address); }

  const whereSql = filters.length ? `where ${filters.join(' and ')}` : '';

  let orderSql = '';
  const allowed = ['name','address','rating'];
  if (sortBy && allowed.includes(sortBy)) {
    const dir = sortOrder?.toLowerCase() === 'desc' ? 'desc' : 'asc';
    if (sortBy === 'rating') orderSql = `order by coalesce(sar.avg_rating,0) ${dir}`;
    else orderSql = `order by s.${sortBy} ${dir}`;
  }

  const sql = `
    select
      s.id, s.name, s.address,
      coalesce(sar.avg_rating,0)::numeric(10,2) as overall_rating,
      (
        select r.rating from ratings r where r.store_id = s.id and r.user_id = $${idx}
      ) as user_rating
    from stores s
    left join store_avg_rating sar on sar.store_id = s.id
    ${whereSql}
    ${orderSql}
  `;
  values.push(userId);

  try {
    const { rows } = await pool.query(sql, values);
    return res.json(rows);
  } catch {
    return res.status(500).json({ message: 'Server error' });
  }
});

/**
 * Submit or modify rating (Normal User only).
 */
router.post('/:id/rate', authenticateJWT, requireRole('user'), [ratingRules, handleValidation], async (req, res) => {
  const storeId = req.params.id;
  const userId = req.user.id;
  const { rating } = req.body;

  try {
    // ensure store exists
    const { rows: st } = await pool.query('select id from stores where id=$1', [storeId]);
    if (!st.length) return res.status(404).json({ message: 'Store not found' });

    await pool.query(
      `
      insert into ratings (user_id, store_id, rating)
      values ($1,$2,$3)
      on conflict (user_id, store_id)
      do update set rating=excluded.rating, updated_at=now()
      `,
      [userId, storeId, rating]
    );

    // return updated aggregate and user rating
    const { rows } = await pool.query(
      `
      select
        coalesce(avg(r.rating),0)::numeric(10,2) as overall_rating,
        sum(1)::int as rating_count,
        (select rating from ratings where user_id=$1 and store_id=$2) as user_rating
      from ratings r where r.store_id=$2
      `,
      [userId, storeId]
    );
    return res.json(rows[0]);
  } catch {
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router;
