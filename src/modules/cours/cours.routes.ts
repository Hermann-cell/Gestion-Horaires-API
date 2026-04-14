import { FastifyInstance } from "fastify";
import {
  addCours,
  listCours,
  getCours,
  editCours,
  removeCours,
} from "./cours.controller.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";

const ALLOWED_ROLES = ["Administrateur", "Responsable administratif"];

type CoursParams = { id: string };

type CreateCoursBody = {
  nom: string;
  code: string;
  duree: number;
  etape: number;
  specialiteId?: number | null;
  typeDeSalleId?: number | null;
  creerPar?: string | null;
};

type UpdateCoursBody = {
  nom?: string;
  code?: string;
  duree?: number;
  etape?: number;
  specialiteId?: number | null;
  typeDeSalleId?: number | null;
  est_harchive?: boolean;
  modifierPar?: string | null;
};

type DeleteCoursBody = {
  supprimePar?: string | null;
};

export async function coursRoutes(app: FastifyInstance) {
  app.post<{ Body: CreateCoursBody }>(
    "/",
    {
      preHandler: [authenticate, authorize(ALLOWED_ROLES)],
    },
    addCours
  );

  app.get(
    "/",
    {
      preHandler: [authenticate, authorize(ALLOWED_ROLES)],
    },
    listCours
  );

  app.get<{ Params: CoursParams }>(
    "/:id",
    {
      preHandler: [authenticate, authorize(ALLOWED_ROLES)],
    },
    getCours
  );

  app.put<{ Params: CoursParams; Body: UpdateCoursBody }>(
    "/:id",
    {
      preHandler: [authenticate, authorize(ALLOWED_ROLES)],
    },
    editCours
  );

  app.delete<{ Params: CoursParams; Body: DeleteCoursBody }>(
    "/:id",
    {
      preHandler: [authenticate, authorize(ALLOWED_ROLES)],
    },
    removeCours
  );
}