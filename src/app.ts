import { join } from 'path'; // Path module for file path operations

import express from 'express'; // Express framework for handling HTTP requests
import appRootPath from 'app-root-path'; // Library for getting the root path of the application

// Custom utility functions for logging and getting IP addresses
import { italic, log, underline } from './utils/logger.js';
import { getPrivateIpAddress } from './utils/getIp.js';

// Controller for handling 404 errors
import { get404 } from './controllers/errors.js';

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

// Middleware to handle 404 errors
app.use(get404);

// Start the Express server
app.listen(PORT, () => {
  log({
    clearConsole: true,
    message: `Server started at port: ${italic(underline(PORT))}`,
  });
  log({
    message: `Visit the server locally at: ${italic(underline(`http://${getPrivateIpAddress()}:${PORT}/`))}`,
  });
});
