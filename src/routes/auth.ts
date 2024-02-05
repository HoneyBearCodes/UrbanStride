import { Router } from 'express';

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

const authRouter = Router();

authRouter.route('/login').get(getLogin).post(postLogin);

authRouter.post('/logout', postLogout);

authRouter.route('/signup').get(getSignup).post(postSignup);

authRouter.route('/reset').get(getReset).post(postReset);

authRouter.get('/reset/:resetToken', getNewPassword);

authRouter.post('/new-password', postNewPassword);

export default authRouter;
