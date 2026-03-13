import { FastifyInstance } from "fastify";
import {
  getAllSalles,
  editSalle,
  getSalle,
  createSalleController,
  deleteSalleController,
} from "./salle.controller.js";

export async function salleRoutes(app: FastifyInstance) {
  app.get("/", getAllSalles);
  app.get("/:id", getSalle);
  app.post("/", createSalleController);
  app.put("/:id", editSalle);
  app.delete("/:id", deleteSalleController);
}