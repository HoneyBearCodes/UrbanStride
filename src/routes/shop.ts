import { Router } from 'express';

import {
  getCart,
  getOrders,
  getProduct,
  getProducts,
  postCart,
  postCartDeleteItem,
  postOrder,
} from '../controllers/shop.js';
import isAuthenticated from '../middlewares/is-auth.js';

const shopRouter = Router();

shopRouter.get('/', getProducts);

shopRouter.get('/products/:productId', getProduct);

shopRouter
  .route('/cart')
  .get(isAuthenticated, getCart)
  .post(isAuthenticated, postCart);

shopRouter.post('/cart-delete-item', isAuthenticated, postCartDeleteItem);

shopRouter.post('/create-order', isAuthenticated, postOrder);

shopRouter.get('/orders', isAuthenticated, getOrders);

export default shopRouter;
