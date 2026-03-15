import { FastifyInstance } from "fastify";
import {
  getAllSpecialites,
  getSpecialite,
  createSpecialiteController,
  editSpecialite,
  deleteSpecialiteController,
} from "./specialite.controller.js";

export async function specialiteRoutes(app: FastifyInstance) {
  app.get("/", getAllSpecialites);
  app.get("/:id", getSpecialite);
  app.post("/", createSpecialiteController);
  app.put("/:id", editSpecialite);
  app.delete("/:id", deleteSpecialiteController);
}