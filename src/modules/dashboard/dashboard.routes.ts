import { FastifyInstance } from "fastify";
import { getDashboardController } from "./dashboard.controller.js";

export async function dashboardRoutes(app: FastifyInstance) {
  app.get("/", getDashboardController);
}