import { Router } from 'express';
import { body } from 'express-validator';

import {
  getLogin,
  postLogin,
  postLogout,
  getSignup,
  postSignup,
  getReset,
  postReset,
  getNewPassword,
  postNewPassword,
} from '../controllers/auth.js';
import User from '../models/user.js';

const authRouter = Router();
const validEmailProviders = [
  'gmail.com',
  'outlook.com',
  'yahoo.com',
  'hotmail.com',
  'outlook.in',
  'icloud.com',
  'aol.com',
  'protonmail.com',
  'protonmail.me',
  'zoho.com',
  'yandex.com',
  'gmx.com',
  'mail.com',
];

authRouter
  .route('/login')
  .get(getLogin)
  .post([body('email').normalizeEmail().trim()], postLogin);

authRouter.post('/logout', postLogout);

authRouter
  .route('/signup')
  .get(getSignup)
  .post(
    [
      body('email')
        .isEmail()
        .withMessage('Please enter a valid email like <user@domain.com>')
        .custom(async (value) => {
          const emailDomain = value.split('@')[1];
          if (!validEmailProviders.includes(emailDomain)) {
            throw new Error(
              'Please use a valid email provider like gmail, outlook, etc.',
            );
          }

          const user = await User.findOne({ email: value });
          if (user) {
            // User already exists
            throw new Error('E-mail already in use. Pick a different one.');
          }
        })
        .normalizeEmail()
        .trim(),
      body('pass', 'Password should beand between 8 to 12 characters.')
        .isLength({ min: 8, max: 12 })
        .trim(),
      body('confirmPass')
        .trim()
        .custom((value, { req }) => {
          if (value !== req.body.pass) {
            throw new Error('Passwords must match!');
          }
          return true;
        }),
    ],
    postSignup,
  );

authRouter.route('/reset').get(getReset).post(postReset);

authRouter.get('/reset/:resetToken', getNewPassword);

authRouter.post('/new-password', postNewPassword);

export default authRouter;
