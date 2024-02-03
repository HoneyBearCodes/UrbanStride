import { join } from 'path'; // Path module for file path operations

import express from 'express'; // Express framework for handling HTTP requests
import appRootPath from 'app-root-path'; // Library for getting the root path of the application
import { connect } from 'mongoose'; // MongoDB connection library

// Custom utility functions for logging and getting IP addresses
import { bold, italic, log, underline, error } from './utils/logger.js';
import { getPrivateIpAddress } from './utils/getIp.js';

// Controller for handling 404 errors
import { get404 } from './controllers/errors.js';

// Routers for different routes
import adminRouter from './routes/admin.js';

// User model
import User, { UserDocument } from './models/user.js';

/**
 * Using module augmentation for patching the `Request` object and
 * adding a user field to it which of type `User`
 */
declare module 'express-serve-static-core' {
  interface Request {
    user: UserDocument;
  }
}

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const rootDir = appRootPath.toString();

// Configure view engine and views directory
app.set('view engine', 'ejs');
app.set('views', join(rootDir, 'src', 'views'));

// Parse incoming request bodies with urlencoded payloads and
// Serve static files from the 'public' directory
app.use(express.urlencoded({ extended: true }));
app.use(express.static(join(rootDir, 'public')));

// Middleware for getting the user and attaching it to the request
// Note: For testing purposes before implementing sessions & auth
app.use(async (req, _res, next) => {
  try {
    const user = await User.findById('65bded4887008b5cdc1b3893');
    if (user) {
      // Here user is an object populated with all the mongoose methods
      // Note: must use module augmentation before accessing req.user
      req.user = user;
      next();
    }
  } catch (err) {
    error(err);
  }
});

app.use('/admin', adminRouter);

// Middleware to handle 404 errors
app.use(get404);

try {
  // Connect to the MongoDB database
  await connect(
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@shopdb.2rf1pd9.mongodb.net/${process.env.MONGO_DEFAULT_DB}?retryWrites=true&w=majority`,
  );
  log({
    clearConsole: true,
    message: `Successfully connected to the ${bold(italic(process.env.MONGO_DEFAULT_DB))} database...`,
  });

  // Create a user if there is none
  // Note: For testing purposes before implementing sessions & auth
  let user = await User.findOne();
  if (!user) {
    user = new User({
      name: 'Test User #01',
      email: 'joemama@isslick.com',
      cart: {
        items: [],
      },
    });

    user.save();
  }

  // Start the Express server
  app.listen(PORT, () => {
    log({
      message: `Server started at port: ${italic(underline(PORT))}`,
    });
    log({
      message: `Visit the server locally at: ${italic(underline(`http://${getPrivateIpAddress()}:${PORT}/`))}`,
    });
  });
} catch (err) {
  // Handle any errors that occur during server startup or database connection
  error(err);
}
