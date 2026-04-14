import { FastifyInstance } from "fastify";
import {
  createPlageHoraireController,
  getAllPlageHorairesController,
  getPlageHoraireController,
  editPlageHoraireController,
  removePlageHoraireController,
} from "./plageHoraire.controller.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";

const ALLOWED_ROLES = ["Administrateur", "Responsable administratif"];

type PlageHoraireParams = {
  id: string;
};

type CreatePlageHoraireBody = {
  heureDebut: string;
  heureFin: string;
};

type UpdatePlageHoraireBody = {
  heureDebut?: string;
  heureFin?: string;
};

export default async function plageHoraireRoutes(app: FastifyInstance) {
  app.get(
    "/",
    {
      preHandler: [authenticate, authorize(ALLOWED_ROLES)],
    },
    getAllPlageHorairesController
  );

  app.get<{ Params: PlageHoraireParams }>(
    "/:id",
    {
      preHandler: [authenticate, authorize(ALLOWED_ROLES)],
    },
    getPlageHoraireController
  );

  app.post<{ Body: CreatePlageHoraireBody }>(
    "/",
    {
      preHandler: [authenticate, authorize(ALLOWED_ROLES)],
    },
    createPlageHoraireController
  );

  app.put<{ Params: PlageHoraireParams; Body: UpdatePlageHoraireBody }>(
    "/:id",
    {
      preHandler: [authenticate, authorize(ALLOWED_ROLES)],
    },
    editPlageHoraireController
  );

  app.delete<{ Params: PlageHoraireParams }>(
    "/:id",
    {
      preHandler: [authenticate, authorize(ALLOWED_ROLES)],
    },
    removePlageHoraireController
  );
}