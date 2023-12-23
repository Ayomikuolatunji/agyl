import "express-async-errors";
import express from "express";
import cors from "cors";
import path from "path";
import { engine } from "express-handlebars";
import compression from "compression";
import { Winston } from "middlewares/errors/winstonErrorLogger";
import { pageNotFound } from "middlewares/errors/404Page";
import requestHeaders from "middlewares/handlers/requestHeaders";
import passport from "passport";
import errorHandler from "middlewares/handlers/requestErrorHandler";
import { PublicRouter } from "routes/public-router";
import { ProtectedRouter } from "routes/protected-routes";
import { Auth } from "middlewares/auth/authToken";

const app = express();

declare module "express-serve-static-core" {
  export interface Request {
    userId: string;
  }
}

/* Middlewares */
app.set("trust proxy", 1);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "DELETE", "PUT"],
    credentials: true,
  })
);

app.use(passport.initialize());
app.use(requestHeaders);
app.use(compression());
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "./views"));
app.engine(
  "handlebars",
  engine({
    defaultLayout: false,
    extname: ".handlebars",
    layoutsDir: path.join(__dirname, "./views"),
    partialsDir: path.join(__dirname, "./views"),
  })
);

app.use("/api/v1/public", PublicRouter);

app.use("/api/v1", Auth, ProtectedRouter);

app.use("/logs", Winston.setupServerErrorRoute);

app.use(pageNotFound);

app.use(Winston.ErrorLogger());

app.use(errorHandler);

export { app };
