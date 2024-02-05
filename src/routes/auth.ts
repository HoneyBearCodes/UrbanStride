import { Router } from 'express';

import {
  getLogin,
  postLogin,
  postLogout,
  getSignup,
  postSignup,
  getReset,
  postReset,
} from '../controllers/auth.js';

const authRouter = Router();

authRouter.route('/login').get(getLogin).post(postLogin);

authRouter.post('/logout', postLogout);

authRouter.route('/signup').get(getSignup).post(postSignup);

authRouter.route('/reset').get(getReset).post(postReset);

export default authRouter;
