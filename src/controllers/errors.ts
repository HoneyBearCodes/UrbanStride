import { RequestHandler } from 'express';

// Request handler for handling 404 (Not Found) errors
export const get404: RequestHandler = (req, res, _next) => {
  // Renders a 404 page with appropriate data
  res.status(404).render('errors/404', {
    pageTitle: '404 ― Page not found!',
    path: '',
    isAuthenticated: req.session.isLoggedIn,
  });
};

// Request handler for handling 500 (Internal Server) errors
export const get500: RequestHandler = (req, res, _next) => {
  // Renders a 500 page with appropriate data
  res.status(500).render('errors/500', {
    pageTitle: '500 ― Internal Server Error!',
    path: '',
    isAuthenticated: req.session.isLoggedIn,
  });
};
