import { join } from 'path';

import { RequestHandler } from 'express';
import { validationResult } from 'express-validator';
import appRootPath from 'app-root-path';
import stripe from 'stripe';

import Product from '../models/product.js';
import { handleError } from '../utils/errorHandler.js';
import { normalizeDBFilePath, removeFile } from '../utils/fileUtils.js';

const rootDir = appRootPath.toString();
const stripeSecretKey = process.env.STRIPE_KEY!;
const stripeClient = new stripe(stripeSecretKey);

// Handler for rendering the product list for the '/admin/product-list'
export const getProducts: RequestHandler = async (req, res, next) => {
  try {
    const products = await Product.find({ userId: req.user._id });
    res.render('admin/product-list', {
      products,
      pageTitle: 'Admin Products',
      path: '/admin/products',
      isAuthenticated: req.session.isLoggedIn,
    });
  } catch (err) {
    handleError(err, next);
  }
};

// Handler for rendering the "Add Product" page
export const getAddProduct: RequestHandler = (req, res) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/edit-product',
    editing: false,
    isAuthenticated: req.session.isLoggedIn,
    errorMessages: [],
    invalidFields: [],
  });
};

// Handler for processing the submission of a new product
export const postAddProduct: RequestHandler = async (req, res, next) => {
  const { title, price, description } = req.body;
  const { file: image } = req;

  const validationErrors = validationResult(req);

  if (!image) {
    return res.status(422).render('admin/edit-product', {
      path: '/admin/edit-product',
      pageTitle: 'Add Product',
      editing: false,
      errorMessages: [
        'Attached file is not an image (only jpeg, jpg or png files allowed)',
      ],
      invalidFields: ['img-container'],
      product: {
        title,
        price,
        description,
      },
    });
  }

  // Constructing the path to file to store in DB
  const imageUrl = `/product_images/${image.filename}`;

  if (!validationErrors.isEmpty()) {
    const errorMessages = validationErrors.array().map((error) => error.msg);
    const invalidFields = validationErrors.array().map((error) => {
      if (error.type === 'field') {
        return error.path;
      }
    });
    return res.status(422).render('admin/edit-product', {
      path: '/admin/edit-product',
      pageTitle: 'Add Product',
      editing: false,
      errorMessages,
      invalidFields,
      product: {
        title,
        price,
        description,
      },
    });
  }

  // Create a new product with the data submitted by user
  const product = new Product({
    title,
    price,
    description,
    // Don't have to explicitly set req.user._id
    // as mongoose will automatically pick it
    userId: req.user,
    imageUrl,
  });

  try {
    // Save the product to the database
    await product.save();

    // Create a product for stripe
    await stripeClient.products.create({
      id: product._id.toString(),
      name: title,
      description,
      images: [`${process.env.DOMAIN}${imageUrl}`],
    });

    // Create a price for the product in Stripe
    await stripeClient.prices.create({
      product: product._id.toString(),
      unit_amount: price * 100,
      currency: 'usd',
    });
  } catch (err) {
    handleError(err, next);
  }

  // Redirect to the admin products page
  res.redirect('/admin/products');
};

// Handler for rendering the edit product page
export const getEditProduct: RequestHandler = async (req, res, next) => {
  if (req.query.edit !== 'true' && req.query.edit !== 'false') {
    return res.redirect('/');
  }

  const editMode = req.query.edit === 'true';
  const { productId } = req.params;

  try {
    const product = await Product.findById(productId);
    if (!product || product.userId.toString() !== req.user._id.toString()) {
      return res.redirect('/admin/products');
    }

    res.render('admin/edit-product', {
      pageTitle: 'Edit Product',
      path: '/admin/edit-product',
      editing: editMode,
      product,
      isAuthenticated: req.session.isLoggedIn,
      errorMessages: [],
      invalidFields: [],
    });
  } catch (err) {
    handleError(err, next);
  }
};

// Handler for updating the edited product details
export const postEditProduct: RequestHandler = async (req, res, next) => {
  const {
    id: productId,
    title: updatedTitle,
    price: updatedPrice,
    description: updatedDescription,
  } = req.body;

  const { file: image } = req;

  const validationErrors = validationResult(req);

  if (!validationErrors.isEmpty()) {
    const errorMessages = validationErrors.array().map((error) => error.msg);
    const invalidFields = validationErrors.array().map((error) => {
      if (error.type === 'field') {
        return error.path;
      }
    });
    return res.status(422).render('admin/edit-product', {
      path: '/admin/edit-product',
      pageTitle: 'Edit Product',
      editing: true,
      errorMessages,
      invalidFields,
      product: {
        title: updatedTitle,
        price: updatedPrice,
        description: updatedDescription,
        _id: productId,
      },
    });
  }

  try {
    const product = await Product.findById(productId);
    if (product && product.userId.toString() === req.user._id.toString()) {
      const imageUrl = image
        ? `/product_images/${image.filename}`
        : product.imageUrl;

      // Update the product details in MongoDB
      product.title = updatedTitle;
      product.price = Number(updatedPrice);
      product.description = updatedDescription;
      product.imageUrl = imageUrl;
      await product.save();

      // Set existing prices in Stripe to inactive
      const prices = await stripeClient.prices.list({
        product: productId,
      });

      for (const price of prices.data) {
        await stripeClient.prices.update(price.id, {
          active: false,
        });
      }

      // Create a new price in Stripe
      await stripeClient.prices.create({
        product: productId,
        unit_amount: updatedPrice * 100,
        currency: 'usd',
      });
    }
  } catch (err) {
    handleError(err, next);
  }
  res.redirect('/admin/products');
};

// Handler for deleting a product
export const deleteProduct: RequestHandler = async (req, res) => {
  const { productId } = req.params;

  try {
    const product = await Product.findOne({
      _id: productId,
      userId: req.user._id,
    });

    if (product) {
      // Set the product and its prices in Stripe to inactive
      await stripeClient.products.update(productId, {
        active: false,
      });

      const prices = await stripeClient.prices.list({
        product: productId,
      });

      for (const price of prices.data) {
        await stripeClient.prices.update(price.id, {
          active: false,
        });
      }

      // Remove the file from the filesystem
      removeFile(
        `${join(rootDir, 'data', ...normalizeDBFilePath(product.imageUrl))}`,
      );

      // Delete the product in MongoDB
      await Product.deleteOne({
        _id: productId,
        userId: req.user._id,
      });

      return res.status(200).json({ message: 'Operation succeeded' });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Operation failed.' });
  }
};
