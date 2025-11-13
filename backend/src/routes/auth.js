import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../db.js';
import { config } from '../config.js';
import { nameRules, emailRules, addressRules, passwordRules } from '../utils/validators.js';
import { handleValidation } from '../middleware/validate.js';
import { authenticateJWT } from '../middleware/auth.js';

const router = Router();

/**
 * Public signup: creates a Normal User.
 */
router.post('/signup', [nameRules, emailRules, addressRules, passwordRules, handleValidation], async (req, res) => {
  const { name, email, address, password } = req.body;
  try {
    const { rows: existing } = await pool.query('select id from users where email=$1', [email]);
    if (existing.length) return res.status(409).json({ message: 'Email already exists' });

    const hash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      'insert into users (name,email,password_hash,address,role) values ($1,$2,$3,$4,$5) returning id,name,email,address,role,created_at',
      [name, email, hash, address, 'user']
    );
    return res.status(201).json(rows[0]);
  } catch (e) {
    return res.status(500).json({ message: 'Server error' });
  }
});

/**
 * Login for all roles.
 */
router.post('/login', [emailRules, passwordRules, handleValidation], async (req, res) => {
  const { email, password } = req.body;
  try {
    const { rows } = await pool.query('select id,name,email,password_hash,address,role from users where email=$1', [email]);
    if (!rows.length) return res.status(401).json({ message: 'Invalid credentials' });
    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, role: user.role, name: user.name, email: user.email }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
    return res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, address: user.address } });
  } catch {
    return res.status(500).json({ message: 'Server error' });
  }
});

/**
 * Update password after login.
 */
router.post('/password', authenticateJWT, [passwordRules, handleValidation], async (req, res) => {
  const { password } = req.body;
  try {
    const hash = await bcrypt.hash(password, 10);
    await pool.query('update users set password_hash=$1 where id=$2', [hash, req.user.id]);
    return res.json({ message: 'Password updated' });
  } catch {
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router;
