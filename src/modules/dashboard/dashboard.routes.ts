import { FastifyInstance } from "fastify";
import { getDashboardController } from "./dashboard.controller.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";

const ALLOWED_ROLES = ["Administrateur", "Responsable administratif"];

export async function dashboardRoutes(app: FastifyInstance) {
  app.get(
    "/",
    {
      preHandler: [authenticate, authorize(ALLOWED_ROLES)],
    },
    getDashboardController
  );
}