import { Router } from 'express';

import {
  getLogin,
  postLogin,
  postLogout,
  getSignup,
  postSignup,
} from '../controllers/auth.js';

const authRouter = Router();

authRouter.route('/login').get(getLogin).post(postLogin);

authRouter.post('/logout', postLogout);

authRouter.route('/signup').get(getSignup).post(postSignup);

export default authRouter;
