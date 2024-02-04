import { Router } from 'express';

import { getLogin } from '../controllers/auth.js';

const authRouter = Router();

authRouter.get('/login', getLogin);

export default authRouter;
