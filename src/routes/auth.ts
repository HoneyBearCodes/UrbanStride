import { Router } from 'express';

import { getLogin, postLogin, postLogout } from '../controllers/auth.js';

const authRouter = Router();

authRouter.route('/login').get(getLogin).post(postLogin);

authRouter.post('/logout', postLogout);

export default authRouter;
