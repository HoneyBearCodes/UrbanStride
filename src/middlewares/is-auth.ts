import { RequestHandler } from 'express';

// Middleware for route protection
const isAuth: RequestHandler = (req, res, next) => {
  // If user not authenticated, redirect to the login page
  if (!req.session.isLoggedIn) {
    return res.redirect('/login');
  }
  next();
};

export default isAuth;
