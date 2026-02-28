import { FastifyInstance } from "fastify";
import { getAllSalles } from "./salle.controller.js";
import { editSalle } from "./salle.controller.js";
import { getSalle } from "./salle.controller.js";

export async function salleRoutes(app: FastifyInstance) {
  app.get("/", getAllSalles);
  app.put("/:id", editSalle); 
  app.get("/:id", getSalle);
}