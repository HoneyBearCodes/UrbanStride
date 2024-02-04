import { RequestHandler } from 'express';
import bcrypt from 'bcryptjs';

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
export const postLogin: RequestHandler<
  unknown,
  unknown,
  { [key: string]: string }
> = async (req, res) => {
  const { email, pass: password } = req.body;

  try {
    // finding user that matches the provided email
    const user = await User.findOne({ email: email });
    if (user) {
      // comparing the provided password with hashed one stored in DB
      const doMatch = await bcrypt.compare(password, user.password);

      if (doMatch) {
        // password matches
        req.session.isLoggedIn = true;
        req.session.user = user;
        // Not necessary but required to make sure only redirect after session created
        req.session.save(() => res.redirect('/'));
      } else {
        res.redirect('/login');
      }
    } else {
      res.redirect('/login');
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
export const postSignup: RequestHandler<
  unknown,
  unknown,
  { [key: string]: string }
> = async (req, res) => {
  const { email, pass: password, confirmPass: _confirmPassword } = req.body;

  // Check if any user with provided email already exists
  try {
    const user = await User.findOne({ email: email });
    if (user) {
      // User already exists
      return res.redirect('/signup');
    }

    // Hashing the password before storing it
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user with provided credentials
    await new User({
      email,
      password: hashedPassword,
      cart: { items: [] },
    }).save();
    res.redirect('/login');
  } catch (err) {
    error(err);
  }
};
