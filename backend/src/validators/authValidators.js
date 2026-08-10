const { body } = require('express-validator');

const phonePattern = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{6,18}$/;
const passwordRule = body('password')
  .isString().withMessage('Password is required')
  .isLength({ min: 8, max: 128 }).withMessage('Password must be 8 to 128 characters long')
  .matches(/[A-Z]/).withMessage('Password must include an uppercase letter')
  .matches(/[a-z]/).withMessage('Password must include a lowercase letter')
  .matches(/[0-9]/).withMessage('Password must include a number');

const nameRule = body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2 to 100 characters long');
const emailRule = body('email').trim().isEmail().withMessage('A valid email is required').normalizeEmail();
const phoneRule = body('phone').trim().matches(phonePattern).withMessage('A valid phone number is required');

const register = [nameRule, emailRule, phoneRule, passwordRule];
const login = [emailRule, body('password').isString().notEmpty().withMessage('Password is required')];
const updateProfile = [
  body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2 to 100 characters long'),
  body('email').optional().trim().isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('phone').optional().trim().matches(phonePattern).withMessage('A valid phone number is required'),
  body('avatar').optional({ nullable: true }).isURL({ protocols: ['http', 'https'], require_protocol: true }).withMessage('Avatar must be a valid URL'),
];
const changePassword = [
  body('currentPassword').isString().notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isString().isLength({ min: 8, max: 128 }).withMessage('New password must be 8 to 128 characters long')
    .matches(/[A-Z]/).withMessage('New password must include an uppercase letter')
    .matches(/[a-z]/).withMessage('New password must include a lowercase letter')
    .matches(/[0-9]/).withMessage('New password must include a number'),
];

module.exports = { register, login, updateProfile, changePassword };
