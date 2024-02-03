import { Router } from 'express';

import {
  getAddProduct,
  getEditProduct,
  getProducts,
  postAddProduct,
  postDeleteProduct,
  postEditProduct,
} from '../controllers/admin.js';

const adminRouter = Router();

adminRouter.route('/add-product').get(getAddProduct).post(postAddProduct);

adminRouter.get('/products', getProducts);

adminRouter.post('/edit-product/:productId', getEditProduct);

adminRouter.post('/edit-product', postEditProduct);

adminRouter.post('/delete-product', postDeleteProduct);

export default adminRouter;
