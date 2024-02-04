import { RequestHandler } from 'express';

import User from '../models/user.js';
import { error } from '../utils/logger.js';

// Handler for fetching and displaying orders
export const getLogin: RequestHandler = (req, res) => {
  if (req.session.isLoggedIn) {
    res.redirect('/');
  } else {
    res.render('auth/login', {
      path: '/login',
      pageTitle: 'Login',
      isAuthenticated: req.session.isLoggedIn,
    });
  }
};

// Handler for logging in the users
export const postLogin: RequestHandler = async (req, res) => {
  try {
    const user = await User.findById('65bf70d1cf2127ca1f12d280');
    if (user) {
      req.session.isLoggedIn = true;
      req.session.user = user;
      // Not necessary but required to make sure only redirect after session created
      req.session.save(() => res.redirect('/'));
    }
  } catch (err) {
    error(err);
    res.redirect('/login');
  }
};

// Handler for logging users out and clearing any session
export const postLogout: RequestHandler = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      error(err);
    }
    res.redirect('/');
  });
};

// Handler for displaying signup page
export const getSignup: RequestHandler = (req, res) => {
  if (req.session.isLoggedIn) {
    res.redirect('/');
  } else {
    res.render('auth/signup', {
      path: '/signup',
      pageTitle: 'Signup',
      isAuthenticated: req.session.isLoggedIn,
    });
  }
};

// Handler for signing up users
export const postSignup: RequestHandler = (_req, _res) => {};
