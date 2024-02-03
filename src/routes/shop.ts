import { Router } from 'express';

import { getProduct, getProducts, postCart } from '../controllers/shop.js';

const shopRouter = Router();

shopRouter.get('/', getProducts);

shopRouter.get('/products/:productId', getProduct);

shopRouter.post('/cart', postCart);

export default shopRouter;
