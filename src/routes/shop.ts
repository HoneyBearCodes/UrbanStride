import { Router } from 'express';

import {
  getCart,
  getProduct,
  getProducts,
  postCart,
} from '../controllers/shop.js';

const shopRouter = Router();

shopRouter.get('/', getProducts);

shopRouter.get('/products/:productId', getProduct);

shopRouter.route('/cart').get(getCart).post(postCart);

export default shopRouter;
