import dotenv from "dotenv";
import express from "express";
import { createApp } from "./app/createApp";

import { logger, morganMiddleware } from "./infrastructure/middlewares/morgan";
import ErrorHandler from "./infrastructure/middlewares/error-handler";
import { AppModule } from "./app/app.module";
import { initializeApp } from "./setup";

dotenv.config();

const app = express();

// Apply the initial middleware before registering routes
initializeApp(app);

// Create the app with registered routes and providers
createApp(app, AppModule);

// Use Morgan middleware for logging
app.use(morganMiddleware);

// Error handling middleware
app.use(ErrorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
