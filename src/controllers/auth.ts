import { RequestHandler } from 'express';

// Handler for fetching and displaying orders
export const getLogin: RequestHandler = (_req, res) => {
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
  });
};
