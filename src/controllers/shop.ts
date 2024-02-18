import { RequestHandler } from 'express';
import stripe from 'stripe';

import Product, { ProductDocument } from '../models/product.js';
import Order from '../models/order.js';
import { handleError } from '../utils/errorHandler.js';
import createInvoice from '../utils/createInvoice.js';

const ITEMS_PER_PAGE = 3;
const stripeSecretKey = process.env.STRIPE_KEY!;
const stripeClient = new stripe(stripeSecretKey);

// Handler for displaying the user product list
export const getProducts: RequestHandler = async (req, res, next) => {
  const page = +req.query.page! || 1;

  try {
    const showPopup = req.session.popupAcknowledged !== false;

    const products = await Product.find()
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE);
    const totalItems = await Product.find().countDocuments();
    res.render('shop/product-list', {
      showPopup,
      products,
      pageTitle: 'All Products',
      path: '/',
      currentPage: page,
      hasNextPage: ITEMS_PER_PAGE * page < totalItems,
      hasPreviousPage: page > 1,
      nextPage: page + 1,
      previousPage: page - 1,
      lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
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

// Handler for serving the checkout the page
export const getCheckout: RequestHandler = async (req, res, next) => {
  try {
    const user = await req.user.populate('cart.items.productId');

    if (user) {
      const cartItems = user.cart.items as unknown;
      let cartTotal = 0;

      (cartItems as { quantity: number; productId: ProductDocument }[]).forEach(
        (item) => {
          cartTotal += item.quantity * item.productId.price;
        },
      );

      res.render('shop/checkout', {
        path: '/checkout',
        pageTitle: 'Checkout',
        cartTotal: cartTotal.toFixed(2),
        products: cartItems,
      });
    }
  } catch (err) {
    handleError(err, next);
  }
};

// Handler for creating a checkout
export const createCheckout: RequestHandler = async (req, res, next) => {
  try {
    const user = await req.user.populate('cart.items.productId');

    if (user) {
      const cartItems = user.cart.items as unknown;

      const pricePromises = (
        cartItems as { quantity: number; productId: ProductDocument }[]
      ).map(async (item) => {
        const price = (
          await stripeClient.prices.list({
            product: item.productId._id.toString(),
          })
        ).data[0].id;

        return { price, quantity: item.quantity };
      });

      const lineItems = await Promise.all(pricePromises);

      const stripeCheckoutSession = await stripeClient.checkout.sessions.create(
        {
          line_items: lineItems,
          mode: 'payment',
          success_url: `${process.env.DOMAIN}/checkout/success`,
          cancel_url: `${process.env.DOMAIN}/cart`,
        },
      );

      req.session.stripeCheckoutSessionId = stripeCheckoutSession.id;

      res.redirect(303, stripeCheckoutSession.url!);
    }
  } catch (err) {
    handleError(err, next);
  }
};

// Handler for creating an order
export const createOrder: RequestHandler = async (req, res, next) => {
  try {
    // Retrieve the session ID from the the user's session
    const sessionId = req.session.stripeCheckoutSessionId;

    if (sessionId) {
      const stripeCheckoutSession =
        await stripeClient.checkout.sessions.retrieve(sessionId);

      // Creating the order in the DB only if the payment was fulfilled
      if (stripeCheckoutSession.payment_status === 'paid') {
        const user = await req.user.populate('cart.items.productId');
        if (user) {
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

            await order.save();
            req.user.clearCart();

            // Clearing the session ID for preventing reuse
            delete req.session.stripeCheckoutSessionId;

            return res.redirect('/orders');
          }
        } else {
          return res.redirect('/404');
        }
      } else {
        return res.redirect('/404');
      }
    } else {
      return res.redirect('/404');
    }
  } catch (err) {
    handleError(err, next);
  }
  res.redirect('/orders');
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

    createInvoice(order, res);
  } catch (err) {
    return handleError(err, next);
  }
};

// Contnroller for submission of popup acknowledgement
export const acknowledgePopup: RequestHandler = (req, res) => {
  req.session.popupAcknowledged = false;
  res.sendStatus(200);
};
