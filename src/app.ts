import Fastify from "fastify";
import prismaPlugin from "./plugins/prisma.js";
import { userRoutes } from "./modules/utilisateur/utilisateur.routes.js";
import { salleRoutes } from "./modules/salle/salle.routes.js";

export function buildApp() {
  const app = Fastify({ logger: true });

  // Register plugins and routes of different modules
  app.register(prismaPlugin);
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
  app.register(userRoutes, { prefix: "/utilisateur" });
  


  
  return app;
}
