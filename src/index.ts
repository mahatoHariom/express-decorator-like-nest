import dotenv from "dotenv";
import express from "express";
import { createApp } from "./app/createApp";
import { logger, morganMiddleware } from "./infrastructure/middlewares/morgan";
import ErrorHandler from "./infrastructure/middlewares/error-handler";
import { AppModule } from "./app/app.module";
import { limiter } from "./infrastructure/config/rate-limit";

dotenv.config();

const app = express();

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(morganMiddleware);

app.use(limiter);

createApp(app, AppModule);

app.use(ErrorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
