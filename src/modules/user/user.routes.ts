import { FastifyInstance } from "fastify";
import * as controller from "./user.controller.js";


export async function userRoutes(fastify: FastifyInstance) {
  fastify.get("/", controller.getUsers);
  fastify.get("/:id", controller.getUser);
  fastify.post("/register", controller.createUser);
  fastify.post("/login", controller.loginController);
  fastify.put("/:id", controller.updateUser);
  fastify.delete("/:id", controller.deleteUser);
  fastify.post("/forgot-password", controller.forgotPasswordController);
  fastify.post("/reset-password", controller.resetPasswordController);
  
}
  
