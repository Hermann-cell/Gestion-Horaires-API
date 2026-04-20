import Fastify from "fastify";
import prismaPlugin from "./plugins/prisma.js";

import fastifyJwt from "@fastify/jwt";
import cors from "@fastify/cors";

import mailerPlugin from "./plugins/mailer.js";
import { emailRoutes } from "./modules/email/email.routes.js";

// Routes
import { userRoutes } from "./modules/user/user.routes.js";
import { salleRoutes } from "./modules/salle/salle.routes.js";
import { professeurRoutes } from "./modules/professeur/professeur.routes.js";
import { coursRoutes } from "./modules/cours/cours.routes.js";
import { programmeRoutes } from "./modules/programme/programme.routes.js";
import { typeSalleRoutes } from "./modules/typeSalle/typeSalle.routes.js";
import { specialiteRoutes } from "./modules/specialite/specialite.routes.js";
import plageHoraireRoutes from "./modules/plageHoraire/plageHoraire.routes.js";
import { seanceRoutes } from "./modules/seance/seance.routes.js";
import { dashboardRoutes } from "./modules/dashboard/dashboard.routes.js";

// Middleware
import { roleRoutes } from "./modules/role/role.routes.js";

export function buildApp() {
  const app = Fastify({ logger: true });

  /*
  ===============================
  REGISTER GLOBAL PLUGINS
  ===============================
  */

  // Prisma
  app.register(prismaPlugin);
  app.register(mailerPlugin);
  // JWT
  app.register(fastifyJwt, {
    secret: process.env.JWT_SECRET || "supersecretkey",
  });

  // CORS (pour React + Vite)
  app.register(cors, {
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      process.env.FRONTEND_URL || "https://gestion-horaires-ui.vercel.app"
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true
  });

  /*
  ===============================
  API ROUTES
  ===============================
  */

  // Versioning API
  const API_PREFIX = "/api";
  app.register(coursRoutes, { prefix: `${API_PREFIX}/cours` });
  // app.register(cours_programmeRoutes, { prefix: `${API_PREFIX}/cours_programmes` });
  // app.register(disponibiliteRoutes, { prefix: `${API_PREFIX}/disponibilites` });
  // app.register(disponibilite_professeurRoutes, { prefix: `${API_PREFIX}/disponibilite_professeurs` });
  app.register(plageHoraireRoutes, { prefix: `${API_PREFIX}/plageHoraires` });
  // app.register(plageHoraire_disponibiliteRoutes, { prefix: `${API_PREFIX}/plageHoraire_disponibilites` });
  app.register(professeurRoutes, { prefix: `${API_PREFIX}/professeurs` });
  app.register(programmeRoutes, { prefix: `${API_PREFIX}/programmes` });
  app.register(roleRoutes, { prefix: `${API_PREFIX}/roles` });
  app.register(salleRoutes, { prefix: `${API_PREFIX}/salles` });
  app.register(seanceRoutes, { prefix: `${API_PREFIX}/seances` });
  app.register(specialiteRoutes, { prefix: `${API_PREFIX}/specialites` });
  // app.register(specialite_professeurRoutes, { prefix: `${API_PREFIX}/specialite_professeurs` });
  app.register(typeSalleRoutes, { prefix: `${API_PREFIX}/typeSalles` });
  app.register(userRoutes, { prefix: `${API_PREFIX}/users` });
  app.register(emailRoutes, { prefix: `${API_PREFIX}/emails` });
  app.register(dashboardRoutes, { prefix: `${API_PREFIX}/dashboard` });


  return app;
}