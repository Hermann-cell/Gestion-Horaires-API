import { FastifyInstance } from "fastify";
import * as controller from "./salle.controller.js";

export async function salleRoutes(fastify: FastifyInstance) {
  // POST /salle  => créer une salle
  fastify.post("/", controller.createSalle);

  // DELETE /salle/:id => supprimer une salle
  fastify.delete("/:id", controller.deleteSalle);
}