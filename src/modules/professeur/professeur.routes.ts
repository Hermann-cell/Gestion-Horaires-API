import { FastifyInstance } from "fastify";
import {
  getProfesseur,
  editProfesseur,
  removeProfesseur,
  createProfesseurController,
  getAllProfesseursController,
} from "../professeur/professeur.controller.js";

export async function professeurRoutes(app: FastifyInstance) {
  app.get("/", getAllProfesseursController);
  app.post("/", createProfesseurController);
  app.get("/:id", getProfesseur);
  app.put("/:id", editProfesseur);
  app.delete("/:id", removeProfesseur);
}