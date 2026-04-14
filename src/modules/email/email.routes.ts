import { FastifyInstance } from "fastify";
import { EmailController } from "./email.controller.js";
import { EmailService } from "./email.service.js";
import { SendEmailDTO } from "./email.types.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";

const ALLOWED_ROLES = ["Administrateur", "Responsable administratif"];

export async function emailRoutes(fastify: FastifyInstance) {
  const emailService = new EmailService(fastify);
  const controller = new EmailController(emailService);

  fastify.post<{ Body: SendEmailDTO }>(
    "/send",
    {
      preHandler: [authenticate, authorize(ALLOWED_ROLES)],
    },
    controller.send
  );
}