import { RequestHandler } from 'express';

// Handler for fetching and displaying orders
export const getLogin: RequestHandler = (req, res) => {
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    isAuthenticated: req.session.isLoggedIn,
  });
};

// Handler for logging in the users
export const postLogin: RequestHandler = (req, res) => {
  req.session.isLoggedIn = true;
  res.redirect('/');
};
