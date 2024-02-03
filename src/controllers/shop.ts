import { RequestHandler } from 'express';

import Product from '../models/product.js';
import { error } from '../utils/logger.js';

// Handler for displaying the user product list
export const getProducts: RequestHandler = async (_req, res) => {
  try {
    const products = await Product.find();
    res.render('shop/product-list', {
      products,
      pageTitle: 'All Products',
      path: '/',
    });
  } catch (err) {
    error(err);
  }
};

// Handler for getting on product (for product details)
export const getProduct: RequestHandler<{ productId: string }> = async (
  req,
  res,
) => {
  const { productId } = req.params;

  try {
    const product = await Product.findById(productId);
    res.render('shop/product-detail', {
      product,
      pageTitle: product?.title,
      path: '/',
    });
  } catch (err) {
    error(err);
  }
};
