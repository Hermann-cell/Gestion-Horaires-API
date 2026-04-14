import fp from "fastify-plugin";
import fastifyJwt from "@fastify/jwt";
import { FastifyInstance } from "fastify";

async function jwtPlugin(fastify: FastifyInstance) {
  fastify.register(fastifyJwt, {
    secret: process.env.JWT_SECRET || "super_secret_change_me",
  });
}

export default fp(jwtPlugin);