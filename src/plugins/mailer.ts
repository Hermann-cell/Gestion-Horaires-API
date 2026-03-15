import fp from "fastify-plugin";
import nodemailer from "nodemailer";
import { FastifyInstance } from "fastify";
import { env } from "../utils/env.js";

async function mailerPlugin(fastify: FastifyInstance) {

  const transporter = nodemailer.createTransport({
    host: env.mail.host,
    port: env.mail.port,
    secure: false,
    auth: {
      user: env.mail.user,
      pass: env.mail.pass
    }
  });

  fastify.decorate("mailer", transporter);
}

export default fp(mailerPlugin);