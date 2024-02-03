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

// Handler for adding item to cart
export const postCart: RequestHandler<
  unknown,
  unknown,
  { productId: string }
> = async (req, res) => {
  const { productId } = req.body;
  try {
    const product = await Product.findById(productId);

    if (product) {
      req.user.addToCart(product);
    }
  } catch (err) {
    error(err);
  }
  res.redirect('/cart');
};

// Handling for displaying all the cart items
export const getCart: RequestHandler = async (req, res) => {
  try {
    const user = await req.user.populate('cart.items.productId');
    const cartItems = user.cart.items;
    if (user) {
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: cartItems,
      });
    }
  } catch (err) {
    error(err);
  }
};

// Handler for deleting a cart item
export const postCartDeleteItem: RequestHandler<
  unknown,
  unknown,
  { productId: string }
> = async (req, res) => {
  const { productId } = req.body;
  try {
    req.user.removeFromCart(productId);
  } catch (err) {
    error(err);
  }
  res.redirect('/cart');
};
