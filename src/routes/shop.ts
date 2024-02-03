import { Router } from 'express';

import {
  getCart,
  getProduct,
  getProducts,
  postCart,
  postCartDeleteItem,
  postOrder,
} from '../controllers/shop.js';

const shopRouter = Router();

shopRouter.get('/', getProducts);

shopRouter.get('/products/:productId', getProduct);

shopRouter.route('/cart').get(getCart).post(postCart);

shopRouter.post('/cart-delete-item', postCartDeleteItem);

shopRouter.post('/create-order', postOrder);

export default shopRouter;
