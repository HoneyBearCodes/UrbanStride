import { join } from 'path';
import { mkdirSync } from 'fs';

import express, { NextFunction, Request, Response } from 'express'; // Express framework for handling HTTP requests
import appRootPath from 'app-root-path'; // Library for getting the root path of the application
import { connect } from 'mongoose'; // MongoDB connection library
import session from 'express-session'; // Library for storing sessions
import { default as connectMongoDBSession } from 'connect-mongodb-session'; // Data store for sessions
import csrf from 'csurf'; // Package for CSRF protection
import flash from 'connect-flash'; // Package for flashing error messages
import multer from 'multer'; // Package for handling mult-part form data
import helmet from 'helmet'; // Package to work in secure response headers
import compression from 'compression'; // Package to compress & optimize assets

// Custom utility functions for logging and getting IP addresses
import { bold, italic, underline, error, log } from './utils/logger.js';
import { getPrivateIpAddress } from './utils/getIp.js';
import { handleError } from './utils/errorHandler.js';

// Controller for handling 404 errors
import { get404, get500 } from './controllers/errors.js';

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
    stripeCheckoutSessionId?: string;
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
const CSRFProtection = csrf();

const fileStorage = multer.diskStorage({
  destination(_req, _file, callback) {
    const path = join(rootDir, 'data', 'product_images');
    mkdirSync(path, { recursive: true });
    callback(null, path);
  },
  filename(_req, file, callback) {
    callback(null, `${new Date().toISOString()}-${file.originalname}`);
  },
});

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  callback: multer.FileFilterCallback,
) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    callback(null, true);
  } else {
    callback(null, false);
  }
};

// Use helmet to configure secure response headers and
// Use compression to compress and optimize assets
app.use(helmet());
app.use(compression());

// Configure view engine and views directory
app.set('view engine', 'ejs');
app.set('views', join(rootDir, 'src', 'views'));

// Parse incoming request bodies with urlencoded payloads and
// multi-part form data payloads
app.use(express.urlencoded({ extended: true }));
app.use(multer({ storage: fileStorage, fileFilter }).single('img'));

// Serve static files from the 'public' and 'images' directory
app.use(express.static(join(rootDir, 'public')));
app.use(
  '/product_images',
  express.static(join(rootDir, 'data', 'product_images')),
);

// Initialize the session and the CSRF protection
// Initialize connect-flash for flashing error messages using the session
app.use(
  session({
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    store: sessionDataStore,
  }),
);
app.use(CSRFProtection);
app.use(flash());

// Setting local variables for the authentication status and csrf token for the views
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.CSRFToken = req.csrfToken();
  next();
});

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
    }
    next();
  } catch (err) {
    handleError(err, next);
  }
});

app.use(shopRouter);
app.use(authRouter);
app.use('/admin', adminRouter);

// Middleware to handle 404 errors
app.use('/500', get500);

// Middleware to handle 404 errors
app.use(get404);

// Error handling middleware
app.use(
  (err: Error, _req: Request, res: Response, _next: NextFunction): void => {
    error(err);
    res.status(500).render('errors/500', {
      pageTitle: '500 ― Internal Server Error!',
      path: '',
    });
  },
);

try {
  // Connect to the MongoDB database
  await connect(MONGODB_URI);
  log(
    `Successfully connected to the ${bold(italic(underline(process.env.MONGO_DEFAULT_DB)))} database...`,
  );

  // Start the Express server
  app.listen(PORT, () => {
    log(`Server started at port: ${italic(underline(PORT))}`);
    log(
      `Visit the server locally at: ${italic(underline(`http://${getPrivateIpAddress()}:${PORT}/`))}`,
    );
  });
} catch (err) {
  // Handle any errors that occur during server startup or database connection
  error(err);
}
