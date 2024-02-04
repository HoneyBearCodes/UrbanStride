import { Router } from 'express';

import {
  getAddProduct,
  getEditProduct,
  getProducts,
  postAddProduct,
  postDeleteProduct,
  postEditProduct,
} from '../controllers/admin.js';
import isAuthenticated from '../middlewares/is-auth.js';

const adminRouter = Router();

adminRouter
  .route('/add-product')
  .get(isAuthenticated, getAddProduct)
  .post(isAuthenticated, postAddProduct);

adminRouter.get('/products', isAuthenticated, getProducts);

adminRouter.post('/edit-product/:productId', isAuthenticated, getEditProduct);

adminRouter.post('/edit-product', isAuthenticated, postEditProduct);

adminRouter.post('/delete-product', isAuthenticated, postDeleteProduct);

export default adminRouter;
