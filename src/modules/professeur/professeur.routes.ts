import { FastifyInstance } from "fastify";
import {
  getProfesseur,
  editProfesseur,
  removeProfesseur,
  createProfesseurController,
  getAllProfesseursController,
  getAvailableSeances,
  assignProfesseur,
} from "../professeur/professeur.controller.js";

export async function professeurRoutes(app: FastifyInstance) {
  // Routes Statiques (Sans paramètres) - TOUJOURS EN PREMIER
  app.get("/", getAllProfesseursController);
  app.post("/", createProfesseurController);
  app.get("/seances-disponibles", getAvailableSeances);

  // Routes avec paramètres
  app.get("/:id", getProfesseur);
  app.put("/:id", editProfesseur);
  app.delete("/:id", removeProfesseur);
  app.post("/:id/assign", assignProfesseur);
}