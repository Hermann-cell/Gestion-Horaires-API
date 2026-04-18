import { FastifyInstance } from "fastify";
import {
  addSeance,
  getSeances,
  getSeance,
  editSeance,
  removeSeance,
  assignProfesseurToSeance,
  unassignProfesseurFromSeance,
} from "./seance.controller.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";

const ALLOWED_ROLES = ["Administrateur", "Responsable administratif"];

type SeanceParams = {
  id: string;
};

type CreateSeanceBody = {
  date: string;
  coursId: number;
  salleId: number;
  plageHoraireId: number;
  professeurId?: number | null;
  creerPar?: string | null;
};

type UpdateSeanceBody = {
  date?: string;
  coursId?: number;
  salleId?: number;
  plageHoraireId?: number;
  professeurId?: number | null;
  modifierPar?: string | null;
};

type DeleteSeanceBody = {
  supprimePar?: string | null;
};

type AffectProfesseurBody = {
  professeurId: number;
  modifierPar?: string | null;
};

export async function seanceRoutes(app: FastifyInstance) {
  app.post<{ Body: CreateSeanceBody }>(
    "/",
    {
      preHandler: [authenticate, authorize(ALLOWED_ROLES)],
    },
    addSeance
  );

  app.get(
    "/",
    {
      preHandler: [authenticate, authorize(ALLOWED_ROLES)],
    },
    getSeances
  );

  app.get<{ Params: SeanceParams }>(
    "/:id",
    {
      preHandler: [authenticate, authorize(ALLOWED_ROLES)],
    },
    getSeance
  );

  app.put<{ Params: SeanceParams; Body: UpdateSeanceBody }>(
    "/:id",
    {
      preHandler: [authenticate, authorize(ALLOWED_ROLES)],
    },
    editSeance
  );

  app.delete<{ Params: SeanceParams; Body: DeleteSeanceBody }>(
    "/:id",
    {
      preHandler: [authenticate, authorize(ALLOWED_ROLES)],
    },
    removeSeance
  );

  app.put<{ Params: SeanceParams; Body: AffectProfesseurBody }>(
    "/:id/affecter-professeur",
    {
      preHandler: [authenticate, authorize(ALLOWED_ROLES)],
    },
    assignProfesseurToSeance
  );

  app.delete<{ Params: SeanceParams }>(
    "/:id/professeur",
    {
      preHandler: [authenticate, authorize(ALLOWED_ROLES)],
    },
    unassignProfesseurFromSeance
  );
}