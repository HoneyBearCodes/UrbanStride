import { Router } from 'express';
import { body } from 'express-validator';

import {
  getAddProduct,
  getEditProduct,
  getProducts,
  postAddProduct,
  deleteProduct,
  postEditProduct,
} from '../controllers/admin.js';
import isAuthenticated from '../middlewares/is-auth.js';

const adminRouter = Router();

adminRouter
  .route('/add-product')
  .get(isAuthenticated, getAddProduct)
  .post(
    [
      body('title')
        .trim()
        .isLength({ min: 5, max: 30 })
        .withMessage('Title should be between 5 and 30 characters.'),
      body('price')
        .isFloat({ min: 1, max: 99999 })
        .withMessage('Price should be between 1 and 99999'),
      body('description')
        .trim()
        .isLength({ min: 5 })
        .withMessage('Description should atleast have 5 characters.'),
    ],
    isAuthenticated,
    postAddProduct,
  );

adminRouter.get('/products', isAuthenticated, getProducts);

adminRouter.post('/edit-product/:productId', isAuthenticated, getEditProduct);

adminRouter.post(
  '/edit-product',
  [
    body('title')
      .trim()
      .isLength({ min: 5, max: 30 })
      .withMessage('Title should be between 5 and 30 characters.'),
    body('price')
      .isFloat({ min: 1, max: 99999 })
      .withMessage('Price should be between 1 and 99999'),
    body('description')
      .trim()
      .isLength({ min: 5 })
      .withMessage('Description should atleast have 5 characters.'),
  ],
  isAuthenticated,
  postEditProduct,
);

adminRouter.delete('/product/:productId', isAuthenticated, deleteProduct);

export default adminRouter;
