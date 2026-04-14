import { FastifyInstance } from "fastify";
import { EmailController } from "./email.controller.js";
import { EmailService } from "./email.service.js";

export async function emailRoutes(fastify: FastifyInstance) {

  const emailService = new EmailService(fastify);
  const controller = new EmailController(emailService);

  fastify.post("/send", controller.send);
}