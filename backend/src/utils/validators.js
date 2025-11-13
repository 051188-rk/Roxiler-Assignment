import { body, query } from 'express-validator';

export const nameRules = body('name')
  .isString().withMessage('Name required')
  .isLength({ min: 20, max: 60 }).withMessage('Name must be 20-60 chars');

export const emailRules = body('email').isEmail().withMessage('Invalid email');

export const addressRules = body('address')
  .isString().withMessage('Address required')
  .isLength({ max: 400 }).withMessage('Address max 400 chars');

export const passwordRules = body('password')
  .isLength({ min: 8, max: 16 }).withMessage('Password 8-16 chars')
  .matches(/[A-Z]/).withMessage('Needs uppercase')
  .matches(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/).withMessage('Needs special char');

export const ratingRules = body('rating')
  .isInt({ min: 1, max: 5 }).withMessage('Rating 1..5');

export const optionalSortRules = [
  query('sortBy').optional().isIn(['name','email','address','role','rating','created_at']).withMessage('Invalid sortBy'),
  query('sortOrder').optional().isIn(['asc','desc']).withMessage('Invalid sortOrder')
];

export const optionalFilterRules = [
  query('name').optional().isString(),
  query('email').optional().isString(),
  query('address').optional().isString(),
  query('role').optional().isIn(['admin','user','owner'])
];
