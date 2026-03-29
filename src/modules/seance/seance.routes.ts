import { FastifyInstance } from "fastify";
import {
  addSeance,
  getSeances,
  getSeance,
  editSeance,
  removeSeance,
  assignProfesseurToSeance,
} from "./seance.controller.js";

export async function seanceRoutes(app: FastifyInstance) {

  app.post("/", addSeance);

  app.get("/", getSeances);

  app.get("/:id", getSeance);

  app.put("/:id", editSeance);

  app.delete("/:id", removeSeance);

  app.put("/:id/affecter-professeur", assignProfesseurToSeance);
}