import { FastifyInstance } from "fastify";
import {
  getAllTypeSalles,
  getTypeSalle,
  createTypeSalleController,
  editTypeSalle,
  deleteTypeSalleController,
} from "./typeSalle.controller.js";

export async function typeSalleRoutes(app: FastifyInstance) {
  app.get("/", getAllTypeSalles);
  app.get("/:id", getTypeSalle);
  app.post("/", createTypeSalleController);
  app.put("/:id", editTypeSalle);
  app.delete("/:id", deleteTypeSalleController);
}