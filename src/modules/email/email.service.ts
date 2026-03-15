import { FastifyInstance } from "fastify";
import { SendEmailDTO } from "./email.types.js";
import { env } from "../../utils/env.js";

export class EmailService {

  constructor(private fastify: FastifyInstance) {}

  async sendEmail(data: SendEmailDTO) {

    const info = await this.fastify.mailer.sendMail({
      from: env.mail.from,
      to: data.to,
      subject: data.subject,
      text: data.text,
      html: data.html
    });

    return info;
  }

}