import { RequestHandler } from 'express';
import PDFDocument from 'pdfkit';

import Product from '../models/product.js';
import Order from '../models/order.js';
import { handleError } from '../utils/errorHandler.js';

// Handler for displaying the user product list
export const getProducts: RequestHandler = async (_req, res, next) => {
  try {
    const products = await Product.find();
    res.render('shop/product-list', {
      products,
      pageTitle: 'All Products',
      path: '/',
    });
  } catch (err) {
    handleError(err, next);
  }
};

// Handler for getting on product (for product details)
export const getProduct: RequestHandler = async (req, res, next) => {
  const { productId } = req.params;

  try {
    const product = await Product.findById(productId);
    res.render('shop/product-detail', {
      product,
      pageTitle: product?.title,
      path: '/',
    });
  } catch (err) {
    handleError(err, next);
  }
};

// Handler for adding item to cart
export const postCart: RequestHandler = async (req, res, next) => {
  const { productId } = req.body;
  try {
    const product = await Product.findById(productId);

    if (product) {
      req.user.addToCart(product);
    }
  } catch (err) {
    handleError(err, next);
  }
  res.redirect('/cart');
};

// Handling for displaying all the cart items
export const getCart: RequestHandler = async (req, res, next) => {
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
    handleError(err, next);
  }
};

// Handler for deleting a cart item
export const postCartDeleteItem: RequestHandler = async (req, res, next) => {
  const { productId } = req.body;
  try {
    req.user.removeFromCart(productId);
  } catch (err) {
    handleError(err, next);
  }
  res.redirect('/cart');
};

// Handler for creating an order
export const postOrder: RequestHandler = async (req, res, next) => {
  try {
    const user = await req.user.populate('cart.items.productId');
    const cartItems = user.cart.items.map(({ productId, quantity }) => ({
      quantity,
      product: { ...productId },
    }));

    if (cartItems) {
      const order = new Order({
        user: {
          name: req.user.email,
          id: req.user,
        },
        products: cartItems,
        dateCreated: new Date(),
      });
      order.save();
      req.user.clearCart();
    }
  } catch (err) {
    handleError(err, next);
  }
  res.redirect('/orders');
};

// Handler for fetching and displaying orders
export const getOrders: RequestHandler = async (req, res, next) => {
  try {
    const orders = await Order.find({ 'user.id': req.user._id });
    if (orders) {
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders,
      });
    }
  } catch (err) {
    handleError(err, next);
  }
};

// Handler for sending invoices
export const postInvoice: RequestHandler = async (req, res, next) => {
  const { orderId } = req.params;

  // Check whether this order belongs to the current logged in user
  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return handleError(new Error('No order found!'), next);
    }
    if (order.user.id.toString() !== req.user._id.toString()) {
      return handleError(new Error('Unauthorized!'), next);
    }

    const invoiceName = `invoice-${orderId}.pdf`;

    // Creating a new pdf document
    const invoiceDocument = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${invoiceName}"`);
    invoiceDocument.pipe(res);

    invoiceDocument.fontSize(26).text('Invoice', {
      underline: true,
    });
    invoiceDocument.fontSize(18).text('------------------------------');
    let totalOrderPrice = 0;
    order.products.forEach(({ product }, quantity) => {
      totalOrderPrice += quantity * product.price;
      invoiceDocument.text(
        `${product.title} - ${quantity} x $${product.price}`,
      );
    });
    invoiceDocument.text('------------------------------');
    invoiceDocument.fontSize(20).text(`Total Price: $${totalOrderPrice}`);

    invoiceDocument.end();
  } catch (err) {
    return handleError(err, next);
  }
};
