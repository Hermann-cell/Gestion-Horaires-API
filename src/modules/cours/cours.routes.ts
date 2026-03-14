import { FastifyInstance } from "fastify";
import { editCours, removeCours } from "./cours.controller.js";

export async function coursRoutes(app: FastifyInstance) {

  app.put("/:id", editCours);
  app.delete("/:id", removeCours);
}