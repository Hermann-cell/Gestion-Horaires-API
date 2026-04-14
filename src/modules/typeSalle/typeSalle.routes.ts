import { FastifyInstance } from "fastify";
import {
  getAllTypeSalles,
  getTypeSalle,
  createTypeSalleController,
  editTypeSalle,
  deleteTypeSalleController,
} from "./typeSalle.controller.js";
import {
  CreateTypeSallePayload,
  UpdateTypeSallePayload,
} from "./typeSalle.service.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";

const ALLOWED_ROLES = ["Administrateur", "Responsable administratif"];

type ListQuery = {
  nom?: string;
};

type TypeSalleParams = {
  id: string;
};

export async function typeSalleRoutes(app: FastifyInstance) {
  app.get<{ Querystring: ListQuery }>(
    "/",
    {
      preHandler: [authenticate, authorize(ALLOWED_ROLES)],
    },
    getAllTypeSalles
  );

  app.get<{ Params: TypeSalleParams }>(
    "/:id",
    {
      preHandler: [authenticate, authorize(ALLOWED_ROLES)],
    },
    getTypeSalle
  );

  app.post<{ Body: CreateTypeSallePayload }>(
    "/",
    {
      preHandler: [authenticate, authorize(ALLOWED_ROLES)],
    },
    createTypeSalleController
  );

  app.put<{ Params: TypeSalleParams; Body: UpdateTypeSallePayload }>(
    "/:id",
    {
      preHandler: [authenticate, authorize(ALLOWED_ROLES)],
    },
    editTypeSalle
  );

  app.delete<{ Params: TypeSalleParams }>(
    "/:id",
    {
      preHandler: [authenticate, authorize(ALLOWED_ROLES)],
    },
    deleteTypeSalleController
  );
}