import { Router } from 'express';

import {
  getCart,
  getCheckout,
  getOrders,
  getProduct,
  getProducts,
  postCart,
  postCartDeleteItem,
  createCheckout,
  postInvoice,
  createOrder,
  acknowledgePopup,
} from '../controllers/shop.js';
import isAuthenticated from '../middlewares/is-auth.js';
import checkPopupAcknowledgement from '../middlewares/checkPopup.js';

const shopRouter = Router();

shopRouter.get('/', getProducts);

shopRouter.get('/products/:productId', getProduct);

shopRouter
  .route('/cart')
  .get(isAuthenticated, getCart)
  .post(isAuthenticated, postCart);

shopRouter.post('/cart-delete-item', isAuthenticated, postCartDeleteItem);

shopRouter.get('/checkout', isAuthenticated, getCheckout);

shopRouter.get('/create-checkout', isAuthenticated, createCheckout);

shopRouter.get('/checkout/success', isAuthenticated, createOrder);

shopRouter.get('/orders', isAuthenticated, getOrders);

shopRouter.post('/orders/:orderId', isAuthenticated, postInvoice);

shopRouter.post(
  '/acknowledge-popup',
  checkPopupAcknowledgement,
  acknowledgePopup,
);

export default shopRouter;
