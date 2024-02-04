import { join } from 'path'; // Path module for file path operations

import express from 'express'; // Express framework for handling HTTP requests
import appRootPath from 'app-root-path'; // Library for getting the root path of the application
import { connect } from 'mongoose'; // MongoDB connection library
import session from 'express-session'; // Library for storing sessions
import { default as connectMongoDBSession } from 'connect-mongodb-session'; // Data store for sessions

// Custom utility functions for logging and getting IP addresses
import { bold, italic, log, underline, error } from './utils/logger.js';
import { getPrivateIpAddress } from './utils/getIp.js';

// Controller for handling 404 errors
import { get404 } from './controllers/errors.js';

// Routers for different routes
import shopRouter from './routes/shop.js';
import adminRouter from './routes/admin.js';
import authRouter from './routes/auth.js';

// User model
import User, { UserDocument } from './models/user.js';

/**
 * Using module augmentation for patching the `Request` object and
 * adding a user field to it which is of type `User`
 */
declare module 'express-serve-static-core' {
  interface Request {
    user: UserDocument;
  }
}

/**
 * Using module augmentation for patching the `Session` object and
 * adding a isLoggedIn field to it which is of type `boolean`
 */
declare module 'express-session' {
  interface Session {
    user: UserDocument;
    isLoggedIn: boolean;
  }
}

const PORT = Number(process.env.PORT) || 3000;
const MONGODB_URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@shopdb.2rf1pd9.mongodb.net/${process.env.MONGO_DEFAULT_DB}?retryWrites=true&w=majority`;
const rootDir = appRootPath.toString();

// Initializing the app and session storage
const app = express();
const MongoDBStore = connectMongoDBSession(session);
const sessionDataStore = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'user_sessions',
});

// Configure view engine and views directory
app.set('view engine', 'ejs');
app.set('views', join(rootDir, 'src', 'views'));

// Parse incoming request bodies with urlencoded payloads and
// Serve static files from the 'public' directory
// Initialize the sessions
app.use(express.urlencoded({ extended: true }));
app.use(express.static(join(rootDir, 'public')));
app.use(
  session({
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    store: sessionDataStore,
  }),
);

// Middleware for getting the user and attaching it to the request
// Note: For testing purposes before implementing sessions & auth
app.use(async (req, _res, next) => {
  if (!req.session.user) {
    return next();
  }

  try {
    const user = await User.findById(req.session.user._id);
    if (user) {
      // Creating a user based on data stored in the session, so the
      // data that persists across requests
      req.user = user;
      next();
    }
  } catch (err) {
    error(err);
  }
});

app.use(shopRouter);
app.use(authRouter);
app.use('/admin', adminRouter);

// Middleware to handle 404 errors
app.use(get404);

try {
  // Connect to the MongoDB database
  await connect(MONGODB_URI);
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
