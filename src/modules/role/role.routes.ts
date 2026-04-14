import { FastifyInstance } from "fastify";
import {
  getAllRoles,
  getRole,
  createRoleController,
  editRole,
  deleteRoleController,
} from "./role.controller.js";
import {
  CreateRolePayload,
  UpdateRolePayload,
} from "./role.service.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";

const ADMIN_ROLES = ["Administrateur"];
const READ_ROLES = ["Administrateur", "Responsable administratif"];

type ListQuery = {
  nom?: string;
};

type RoleParams = {
  id: string;
};

export async function roleRoutes(app: FastifyInstance) {
  app.get<{ Querystring: ListQuery }>(
    "/",
    {
      preHandler: [authenticate, authorize(READ_ROLES)],
    },
    getAllRoles
  );

  app.get<{ Params: RoleParams }>(
    "/:id",
    {
      preHandler: [authenticate, authorize(READ_ROLES)],
    },
    getRole
  );

  app.post<{ Body: CreateRolePayload }>(
    "/",
    {
      preHandler: [authenticate, authorize(ADMIN_ROLES)],
    },
    createRoleController
  );

  app.put<{ Params: RoleParams; Body: UpdateRolePayload }>(
    "/:id",
    {
      preHandler: [authenticate, authorize(ADMIN_ROLES)],
    },
    editRole
  );

  app.delete<{ Params: RoleParams }>(
    "/:id",
    {
      preHandler: [authenticate, authorize(ADMIN_ROLES)],
    },
    deleteRoleController
  );
}