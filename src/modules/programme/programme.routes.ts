import { FastifyInstance } from "fastify";
import {
  addProgramme,
  getProgrammes,
  getProgramme,
  editProgramme,
  removeProgramme,
} from "./programme.controller.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";

const ALLOWED_ROLES = ["Administrateur", "Responsable administratif"];

type ProgrammeParams = {
  id: string;
};

type CreateProgrammeBody = {
  nom: string;
  description?: string | null;
  creerPar?: string | null;
};

type UpdateProgrammeBody = {
  nom?: string;
  description?: string | null;
  modifierPar?: string | null;
};

type DeleteProgrammeBody = {
  supprimePar?: string | null;
};

export async function programmeRoutes(app: FastifyInstance) {
  app.post<{ Body: CreateProgrammeBody }>(
    "/",
    {
      preHandler: [authenticate, authorize(ALLOWED_ROLES)],
    },
    addProgramme
  );

  app.get(
    "/",
    {
      preHandler: [authenticate, authorize(ALLOWED_ROLES)],
    },
    getProgrammes
  );

  app.get<{ Params: ProgrammeParams }>(
    "/:id",
    {
      preHandler: [authenticate, authorize(ALLOWED_ROLES)],
    },
    getProgramme
  );

  app.put<{ Params: ProgrammeParams; Body: UpdateProgrammeBody }>(
    "/:id",
    {
      preHandler: [authenticate, authorize(ALLOWED_ROLES)],
    },
    editProgramme
  );

  app.delete<{ Params: ProgrammeParams; Body: DeleteProgrammeBody }>(
    "/:id",
    {
      preHandler: [authenticate, authorize(ALLOWED_ROLES)],
    },
    removeProgramme
  );
}