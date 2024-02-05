import { join } from 'path';
import { readFileSync } from 'fs';
import { randomBytes } from 'crypto';

import { RequestHandler } from 'express';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import appRootPath from 'app-root-path';
import { compile } from 'ejs';

import User from '../models/user.js';
import { error } from '../utils/logger.js';

const rootDir = appRootPath.toString();

const welcomeMailTemplatePath = join(rootDir, 'src', 'emails', 'welcome.ejs');
const welcomeMailTemplate = readFileSync(welcomeMailTemplatePath, 'utf-8');
const compiledWelcomeTemplate = compile(welcomeMailTemplate);

const resetMailTemplatePath = join(rootDir, 'src', 'emails', 'reset.ejs');
const resetMailTemplate = readFileSync(resetMailTemplatePath, 'utf-8');
const compiledResetTemplate = compile(resetMailTemplate);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

// Handler for fetching and displaying orders
export const getLogin: RequestHandler = (req, res) => {
  if (req.session.isLoggedIn) {
    res.redirect('/');
  } else {
    res.render('auth/login', {
      path: '/login',
      pageTitle: 'Login',
      errorMessages: req.flash('error'),
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
        req.flash('error', 'Invalid email or password.');
        res.redirect('/login');
      }
    } else {
      req.flash('error', 'Invalid email or password.');
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
      errorMessages: req.flash('error'),
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
      req.flash('error', 'E-mail already in use. Pick a different one.');
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

    const welcomeMailHTML = compiledWelcomeTemplate({
      email,
      password,
      currentYear: new Date().getFullYear(),
    });

    const welcomeMailOptions = {
      from: `"Urban Stride" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'Signup Successful🥳!',
      text: 'Signup successful.',
      html: welcomeMailHTML,
    };

    transporter.sendMail(welcomeMailOptions);
  } catch (err) {
    error(err);
  }
};

// Handler for getting the password reset page
export const getReset: RequestHandler = (req, res) => {
  res.render('auth/reset', {
    path: '/signup',
    pageTitle: 'Reset Password',
    errorMessages: req.flash('error'),
  });
};

// Handler for resetting the user's password
export const postReset: RequestHandler<
  unknown,
  unknown,
  { [key: string]: string }
> = (req, res) => {
  const { email } = req.body;

  randomBytes(32, async (err, buffer) => {
    if (err) {
      error(err);
      return res.redirect('/');
    }

    const resetToken = buffer.toString('hex');

    try {
      const user = await User.findOne({ email: email });
      if (!user) {
        req.flash('error', 'No account with that email found.');
        return res.redirect('/reset');
      }
      user.resetToken = resetToken;
      user.resetTokenExpiration = new Date(Date.now() + 10800000);
      await user.save();

      const resetMailHTML = compiledResetTemplate({
        resetToken,
        currentYear: new Date().getFullYear(),
      });

      const resetMailOptions = {
        from: `"Urban Stride" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: 'Reset Your Password',
        text: 'Password reset link',
        html: resetMailHTML,
      };

      transporter.sendMail(resetMailOptions);
      res.redirect('/');
    } catch (err) {
      error(err);
    }
  });
};

// Handler for getting the create new password page
export const getNewPassword: RequestHandler<{ resetToken: string }> = async (
  req,
  res,
) => {
  const { resetToken } = req.params;

  try {
    const user = await User.findOne({
      resetToken,
      resetTokenExpiration: { $gt: Date.now() },
    });

    if (user) {
      res.render('auth/new-password', {
        path: '/signup',
        pageTitle: 'Create new password',
        errorMessages: req.flash('error'),
        resetToken,
        userId: user._id.toString(),
      });
    }
  } catch (err) {
    error(err);
  }
};

// Handler for updating the user's password
export const postNewPassword: RequestHandler<
  unknown,
  unknown,
  { [key: string]: string }
> = async (req, res) => {
  const { pass: newPassword, userId, resetToken } = req.body;

  try {
    const user = await User.findOne({
      resetToken,
      resetTokenExpiration: { $gt: new Date(Date.now()) },
      _id: userId,
    });

    if (user) {
      const hashedNewPassword = await bcrypt.hash(newPassword, 12);
      user.password = hashedNewPassword;
      user.resetToken = undefined;
      user.resetTokenExpiration = undefined;
      await user.save();
      res.redirect('/');
    }
  } catch (err) {
    error(err);
  }
};
