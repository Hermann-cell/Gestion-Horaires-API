import { FastifyInstance } from "fastify";
import * as controller from "./user.controller.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";
import { CreateUserDto } from "./dto/create-user.dto.js";
import { UpdateUserDto } from "./dto/update-user.dto.js";

const ADMIN_ROLES = ["ADMIN", "Administrateur"];

export async function userRoutes(fastify: FastifyInstance) {
  // routes publiques
  fastify.post("/login", controller.loginController);
  fastify.post("/forgot-password", controller.forgotPasswordController);
  fastify.post("/reset-password", controller.resetPasswordController);

  // admin seulement
  fastify.post<{ Body: CreateUserDto }>(
    "/register",
    {
      preHandler: [authenticate, authorize(ADMIN_ROLES)],
    },
    controller.createUser
  );

  fastify.get(
    "/",
    {
      preHandler: [authenticate, authorize(ADMIN_ROLES)],
    },
    controller.getUsers
  );

  fastify.get<{ Params: { id: string } }>(
    "/:id",
    {
      preHandler: [authenticate, authorize(ADMIN_ROLES)],
    },
    controller.getUser
  );

  fastify.put<{ Params: { id: string }; Body: UpdateUserDto }>(
    "/:id",
    {
      preHandler: [authenticate, authorize(ADMIN_ROLES)],
    },
    controller.updateUser
  );

  fastify.delete<{ Params: { id: string } }>(
    "/:id",
    {
      preHandler: [authenticate, authorize(ADMIN_ROLES)],
    },
    controller.deleteUser
  );
}