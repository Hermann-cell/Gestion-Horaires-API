import { FastifyInstance } from "fastify";
import {
  addCours,
  listCours,
  getCours,
  editCours,
  removeCours,
} from "./cours.controller.js";

export async function coursRoutes(app: FastifyInstance) {
  app.post("/", addCours);
  app.get("/", listCours);
  app.get("/:id", getCours);
  app.put("/:id", editCours);
  app.delete("/:id", removeCours);
}