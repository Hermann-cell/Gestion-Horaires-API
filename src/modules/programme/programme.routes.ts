import { FastifyInstance } from "fastify";
import {
  addProgramme,
  getProgrammes,
  getProgramme,
  editProgramme,
  removeProgramme,
} from "./programme.controller.js";

export async function programmeRoutes(app: FastifyInstance) {
  
  app.post("/", addProgramme);

  app.get("/", getProgrammes);

  app.get("/:id", getProgramme);

  app.put("/:id", editProgramme);

  app.delete("/:id", removeProgramme);
}