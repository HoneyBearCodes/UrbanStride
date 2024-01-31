import { RequestHandler } from 'express';

// Request handler for handling 404 (Not Found) errors
export const get404: RequestHandler = (_req, res, _next) => {
  // Renders a 404 page with appropriate data
  res.status(404).render('404', {
    pageTitle: '404 ― Page not found!',
    path: '',
  });
};
