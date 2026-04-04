import { FastifyInstance } from "fastify";
import {
  createPlageHoraireController,
  getAllPlageHorairesController,
  getPlageHoraireController,
  editPlageHoraireController,
  removePlageHoraireController,
} from "./plageHoraire.controller.js";

export default async function plageHoraireRoutes(app: FastifyInstance) {
  app.get("/", getAllPlageHorairesController);
  app.get("/:id", getPlageHoraireController);
  app.post("/", createPlageHoraireController);
  app.put("/:id", editPlageHoraireController);
  app.delete("/:id", removePlageHoraireController);
}