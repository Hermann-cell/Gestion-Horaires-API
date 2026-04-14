import { FastifyInstance } from "fastify";
import {
  getAllSalles,
  editSalle,
  getSalle,
  createSalleController,
  deleteSalleController,
} from "./salle.controller.js";
import {
  CreateSallePayload,
  UpdateSallePayload,
} from "./salle.service.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";

const ALLOWED_ROLES = ["Administrateur", "Responsable administratif"];

type ListQuery = {
  code?: string;
  typeDeSalleId?: string;
};

type SalleParams = {
  id: string;
};

export async function salleRoutes(app: FastifyInstance) {
  app.get<{ Querystring: ListQuery }>(
    "/",
    {
      preHandler: [authenticate, authorize(ALLOWED_ROLES)],
    },
    getAllSalles
  );

  app.get<{ Params: SalleParams }>(
    "/:id",
    {
      preHandler: [authenticate, authorize(ALLOWED_ROLES)],
    },
    getSalle
  );

  app.post<{ Body: CreateSallePayload }>(
    "/",
    {
      preHandler: [authenticate, authorize(ALLOWED_ROLES)],
    },
    createSalleController
  );

  app.put<{ Params: SalleParams; Body: UpdateSallePayload }>(
    "/:id",
    {
      preHandler: [authenticate, authorize(ALLOWED_ROLES)],
    },
    editSalle
  );

  app.delete<{ Params: SalleParams }>(
    "/:id",
    {
      preHandler: [authenticate, authorize(ALLOWED_ROLES)],
    },
    deleteSalleController
  );
}