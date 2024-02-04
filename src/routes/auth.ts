import { Router } from 'express';

import { getLogin, postLogin } from '../controllers/auth.js';

const authRouter = Router();

authRouter.route('/login').get(getLogin).post(postLogin);

export default authRouter;
