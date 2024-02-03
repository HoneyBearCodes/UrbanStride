import { Router } from 'express';

import { getProduct, getProducts } from '../controllers/shop.js';

const shopRouter = Router();

shopRouter.get('/', getProducts);

shopRouter.get('/products/:productId', getProduct);

export default shopRouter;
