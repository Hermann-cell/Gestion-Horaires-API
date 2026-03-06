import { FastifyInstance } from "fastify";
import * as controller from "./utilisateur.controller.js";

export async function userRoutes(fastify: FastifyInstance) {
  fastify.get("/", controller.getUsers);
  fastify.get("/:id", controller.getUser);
  fastify.post("/", controller.createUser);
  fastify.put("/:id", controller.updateUser);
  fastify.delete("/:id", controller.deleteUser);
  
}

