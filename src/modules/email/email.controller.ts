import { FastifyReply, FastifyRequest } from "fastify";
import { EmailService } from "./email.service.js";
import { SendEmailDTO } from "./email.types.js";

export class EmailController {

  constructor(private emailService: EmailService) {}

  send = async (
    request: FastifyRequest<{ Body: SendEmailDTO }>,
    reply: FastifyReply
  ) => {

    const result = await this.emailService.sendEmail(request.body);

    return reply.send({
      message: "Email sent successfully",
      result
    });
  };

}