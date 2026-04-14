import { FastifyInstance } from "fastify";
import {
  getAllSpecialites,
  getSpecialite,
  createSpecialiteController,
  editSpecialite,
  deleteSpecialiteController,
} from "./specialite.controller.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";

const ALLOWED_ROLES = ["Administrateur", "Responsable administratif"];

type ListQuery = {
  nom?: string;
};

type SpecialiteParams = {
  id: string;
};

type CreateSpecialiteBody = {
  nom: string;
};

type UpdateSpecialiteBody = {
  nom?: string;
};

export async function specialiteRoutes(app: FastifyInstance) {
  app.get<{ Querystring: ListQuery }>(
    "/",
    {
      preHandler: [authenticate, authorize(ALLOWED_ROLES)],
    },
    getAllSpecialites
  );

  app.get<{ Params: SpecialiteParams }>(
    "/:id",
    {
      preHandler: [authenticate, authorize(ALLOWED_ROLES)],
    },
    getSpecialite
  );

  app.post<{ Body: CreateSpecialiteBody }>(
    "/",
    {
      preHandler: [authenticate, authorize(ALLOWED_ROLES)],
    },
    createSpecialiteController
  );

  app.put<{ Params: SpecialiteParams; Body: UpdateSpecialiteBody }>(
    "/:id",
    {
      preHandler: [authenticate, authorize(ALLOWED_ROLES)],
    },
    editSpecialite
  );

  app.delete<{ Params: SpecialiteParams }>(
    "/:id",
    {
      preHandler: [authenticate, authorize(ALLOWED_ROLES)],
    },
    deleteSpecialiteController
  );
}