import { join } from 'path'; // Path module for file path operations

import express from 'express'; // Express framework for handling HTTP requests
import appRootPath from 'app-root-path'; // Library for getting the root path of the application
import { italic, log, underline } from './utils/logger.js';
import { getPrivateIpAddress } from './utils/getIp.js';

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const rootDir = appRootPath.toString();

// Parse incoming request bodies with urlencoded payloads and
// Serve static files from the 'public' directory
app.use(express.urlencoded({ extended: true }));
app.use(express.static(join(rootDir, 'public')));

app.get('/', (_req, res, _next) => {
  res.send('ehho');
});

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
