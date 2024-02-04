import { RequestHandler } from 'express';

import Product, { ProductDocument } from '../models/product.js';
import { error, log } from '../utils/logger.js';

// Handler for rendering the product list for the '/admin/product-list'
export const getProducts: RequestHandler = async (req, res) => {
  try {
    const products = await Product.find();
    res.render('admin/product-list', {
      products,
      pageTitle: 'Admin Products',
      path: '/admin/products',
      isAuthenticated: req.session.isLoggedIn,
    });
  } catch (err) {
    error(err);
  }
};

// Handler for rendering the "Add Product" page
export const getAddProduct: RequestHandler = (req, res) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/edit-product',
    editing: false,
    isAuthenticated: req.session.isLoggedIn,
  });
};

// Handler for processing the submission of a new product
export const postAddProduct: RequestHandler<
  unknown,
  unknown,
  ProductDocument
> = async (req, res) => {
  const { title, price, description } = req.body;

  // Create a new product with the data submitted by user
  const product = new Product({
    title,
    price,
    description,
    // Don't have to explicitly set req.user._id
    // as mongoose will automatically pick it
    userId: req.user,
  });

  try {
    // Save the product to the database
    await product.save();

    // Log a success message and the created product
    log({ message: 'Product successfully created' });
    log({ object: product });
  } catch (err) {
    // If an error occurs, log it
    error(err);
  }

  // Redirect to the admin products page
  res.redirect('/admin/products');
};

// Handler for rendering the edit product page
export const getEditProduct: RequestHandler<
  { productId: string },
  unknown,
  unknown,
  { [key: string]: string | unknown }
> = async (req, res) => {
  if (req.query.edit !== 'true' && req.query.edit !== 'false') {
    return res.redirect('/');
  }

  const editMode = req.query.edit === 'true';
  const { productId } = req.params;

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.redirect('/');
    }

    res.render('admin/edit-product', {
      pageTitle: 'Edit Product',
      path: '/admin/edit-product',
      editing: editMode,
      product,
      isAuthenticated: req.session.isLoggedIn,
    });
  } catch (err) {
    error(err);
  }
};

// Handler for updating the edited product details
export const postEditProduct: RequestHandler<
  unknown,
  unknown,
  { [key: string]: string }
> = async (req, res) => {
  const {
    id: productId,
    title: updatedTitle,
    price: updatedPrice,
    description: updatedDescription,
  } = req.body;

  try {
    const product = await Product.findById(productId);
    if (product) {
      product.title = updatedTitle;
      product.price = Number(updatedPrice);
      product.description = updatedDescription;
      product.save();
    }
  } catch (err) {
    error(err);
  }
  res.redirect('/admin/products');
};

// Handler for deleting a product
export const postDeleteProduct: RequestHandler<
  unknown,
  unknown,
  { [key: string]: string }
> = async (req, res) => {
  const { id: productId } = req.body;
  try {
    await Product.findByIdAndDelete(productId);
  } catch (err) {
    error(err);
  }
  res.redirect('/admin/products');
};
