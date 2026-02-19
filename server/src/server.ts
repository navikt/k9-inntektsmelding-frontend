import express from "express";

import { setupActuators } from "./actuators.js";
import { setupApiProxy } from "./apiProxy.js";
import config from "./config.js";
import { errorHandling } from "./errorHandler.js";
import { setupStaticRoutes } from "./frontendRoute.js";
import { verifyToken } from "./tokenValidation.js";

const app = express();

// Restricts the server to only accept UTF-8 encoding of bodies
app.use(express.urlencoded({ extended: true }));

setupActuators(app);

const protectedRouter = express.Router();
app.set("trust proxy", true);

app.use(verifyToken);

setupApiProxy(protectedRouter);
// Catch all route, må være sist
setupStaticRoutes(protectedRouter);

app.use(config.app.nestedPath, protectedRouter);

app.use(errorHandling);

export default app;
