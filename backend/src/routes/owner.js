import { Router } from 'express';
import { pool } from '../db.js';
import { authenticateJWT, requireRole } from '../middleware/auth.js';

const router = Router();
router.use(authenticateJWT, requireRole('owner'));

/**
 * Owner dashboard: average rating and list of users who rated their stores.
 */
router.get('/dashboard', async (req, res) => {
  const ownerId = req.user.id;
  try {
    const { rows: stores } = await pool.query(
      `select s.id, s.name from stores s where s.owner_user_id=$1`, [ownerId]
    );

    const details = [];
    for (const s of stores) {
      const [{ rows: avg }, { rows: raters }] = await Promise.all([
        pool.query(`select coalesce(avg(r.rating),0)::numeric(10,2) as avg_rating, count(r.id)::int as rating_count from ratings r where r.store_id=$1`, [s.id]),
        pool.query(`
          select u.id, u.name, u.email, r.rating, r.updated_at
          from ratings r join users u on u.id = r.user_id
          where r.store_id=$1
          order by r.updated_at desc
        `, [s.id])
      ]);
      details.push({
        storeId: s.id,
        storeName: s.name,
        avgRating: avg[0].avg_rating,
        ratingCount: avg[0].rating_count,
        raters
      });
    }

    return res.json({ stores: details });
  } catch {
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router;
