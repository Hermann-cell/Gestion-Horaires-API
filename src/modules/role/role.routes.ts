import { FastifyInstance } from "fastify";
import {
  getAllRoles,
  getRole,
  createRoleController,
  editRole,
  deleteRoleController,
} from "./role.controller.js";

export async function roleRoutes(app: FastifyInstance) {
  app.get("/", getAllRoles);
  app.get("/:id", getRole);
  app.post("/", createRoleController);
  app.put("/:id", editRole);
  app.delete("/:id", deleteRoleController);
}