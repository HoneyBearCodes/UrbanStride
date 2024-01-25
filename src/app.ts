import { join } from 'path'; // Path module for file path operations

import express from 'express'; // Express framework for handling HTTP requests
import appRootPath from 'app-root-path'; // Library for getting the root path of the application

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const rootDir = appRootPath.toString();

// Parse incoming request bodies with urlencoded payloads and
// Serve static files from the 'public' directory
app.use(express.urlencoded({ extended: true }));
app.use(express.static(join(rootDir, 'public')));

// Start the Express server
app.listen(PORT, () => {
  console.log(`Server started at port: ${PORT}`);
  console.log(`Visit the server at: http://localhost:${PORT}/`);
});
