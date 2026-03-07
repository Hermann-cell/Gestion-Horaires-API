import Fastify from "fastify";
import prismaPlugin from "./plugins/prisma.js";
import { userRoutes } from "./modules/user/user.routes.js";
import { salleRoutes } from "./modules/salle/salle.routes.js";
import fastifyJwt from "@fastify/jwt"; // Import du plugin JWT
import { authenticate } from "./modules/middlewares/authenticate.js";

export function buildApp() {
  const app = Fastify({ logger: true });

  // Register plugins and routes of different modules
  app.register(prismaPlugin);
  app.register(fastifyJwt, {
    secret: process.env.JWT_SECRET || "supersecretkey",
  });
  app.register(userRoutes, { prefix: "/cours" });
  app.register(userRoutes, { prefix: "/cours_programme" });
  app.register(userRoutes, { prefix: "/disponibilite" });
  app.register(userRoutes, { prefix: "/disponibilite_professeur" });
  app.register(userRoutes, { prefix: "/plageHoraire" });
  app.register(userRoutes, { prefix: "/plageHoraire_disponibilite" });
  app.register(userRoutes, { prefix: "/professeur" });
  app.register(userRoutes, { prefix: "/programme" });
  app.register(userRoutes, { prefix: "/role" });
  app.register(salleRoutes, { prefix: "/salle" });
  app.register(userRoutes, { prefix: "/seance" });
  app.register(userRoutes, { prefix: "/specialite" });
  app.register(userRoutes, { prefix: "/specialite_professeur" });
  app.register(userRoutes, { prefix: "/typeSalle" });
  app.register(userRoutes, { prefix: "/user" });


  // Applique authenticate à toutes les routes
  // app.addHook("preValidation", async (request, reply) => {
  //   await authenticate(request, reply);
  // });


  return app;
}
