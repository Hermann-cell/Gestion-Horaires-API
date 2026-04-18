import { FastifyInstance } from "fastify";
import {
  getProfesseur,
  editProfesseur,
  removeProfesseur,
  createProfesseurController,
  getAllProfesseursController,
  getAvailableSeances,
  assignProfesseur,
  getAllProfesseursWithPlanningController,
} from "../professeur/professeur.controller.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";

const ALLOWED_ROLES = ["Administrateur", "Responsable administratif"];

type ProfesseurParams = {
  id: string;
};

type CreateProfesseurBody = {
  nom: string;
  prenom: string;
  specialiteIds?: number[];
};

type UpdateProfesseurBody = {
  nom?: string;
  prenom?: string;
};

type AssignProfesseurBody = {
  seanceId: number;
};

export async function professeurRoutes(app: FastifyInstance) {
  // Routes statiques
  app.get(
    "/",
    {
      preHandler: [authenticate, authorize(ALLOWED_ROLES)],
    },
    getAllProfesseursController
  );

  app.post<{ Body: CreateProfesseurBody }>(
    "/",
    {
      preHandler: [authenticate, authorize(ALLOWED_ROLES)],
    },
    createProfesseurController
  );

  app.get(
    "/seances-disponibles",
    {
      preHandler: [authenticate, authorize(ALLOWED_ROLES)],
    },
    getAvailableSeances
  );

  app.get(
    "/all/plannings",
    {
      preHandler: [authenticate, authorize(ALLOWED_ROLES)],
    },
    getAllProfesseursWithPlanningController
  );

  // Routes avec paramètres
  app.get<{ Params: ProfesseurParams }>(
    "/:id",
    {
      preHandler: [authenticate, authorize(ALLOWED_ROLES)],
    },
    getProfesseur
  );

  app.put<{ Params: ProfesseurParams; Body: UpdateProfesseurBody }>(
    "/:id",
    {
      preHandler: [authenticate, authorize(ALLOWED_ROLES)],
    },
    editProfesseur
  );

  app.delete<{ Params: ProfesseurParams }>(
    "/:id",
    {
      preHandler: [authenticate, authorize(ALLOWED_ROLES)],
    },
    removeProfesseur
  );

  app.post<{ Params: ProfesseurParams; Body: AssignProfesseurBody }>(
    "/:id/assign",
    {
      preHandler: [authenticate, authorize(ALLOWED_ROLES)],
    },
    assignProfesseur
  );
}