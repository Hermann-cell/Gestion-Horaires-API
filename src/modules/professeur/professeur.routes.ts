import { FastifyInstance } from "fastify";
import {
  getProfesseur,
  editProfesseur,
  removeProfesseur,
} from "./professeur.controller.js";

import { createProfesseurController,
  getAllProfesseursController,

} from "./professeur.controller.js";


export async function professeurRoutes(app: FastifyInstance) {
  app.get("/:id", getProfesseur);
  app.put("/:id", editProfesseur);
  app.delete("/:id", removeProfesseur);
  app.post("/", createProfesseurController);
  app.get("/", getAllProfesseursController);

}