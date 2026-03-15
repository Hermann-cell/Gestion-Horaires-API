import { FastifyReply, FastifyRequest } from "fastify";
import {
  getCoursById,
  updateCours,
  softDeleteCours,
  isPrismaKnownError,
  type UpdateCoursPayload,
} from "./cours.service.js";

type CoursParams = {
  id: string;
};

type UpdateCoursBody = {
  nom?: string;
  code?: string;
  duree?: number;
  etape?: number;
  est_harchive?: boolean;
  modifierPar?: string | null;
};

type DeleteCoursBody = {
  supprimePar?: string | null;
};

function parseId(id: string): number | null {
  const parsedId = Number(id);

  if (!Number.isInteger(parsedId) || parsedId <= 0) {
    return null;
  }

  return parsedId;
}

function isBlankString(value: unknown): boolean {
  return typeof value === "string" && value.trim() === "";
}

function normalizeString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeNullableString(value: unknown): string | null {
  if (value === null) return null;
  return typeof value === "string" ? value.trim() : null;
}

/*
================================
API : UPDATE COURS
================================
*/
export async function editCours(
  request: FastifyRequest<{
    Params: CoursParams;
    Body: UpdateCoursBody;
  }>,
  reply: FastifyReply
) {
  const id = parseId(request.params.id);

  if (!id) {
    return reply.code(400).send({
      message: "Identifiant du cours invalide",
    });
  }

  const body = request.body ?? {};

  // Validation : body vide
  if (Object.keys(body).length === 0) {
    return reply.code(400).send({
      message: "Aucune donnée à modifier",
    });
  }

  // Validation : type du champ nom
  if (body.nom !== undefined && typeof body.nom !== "string") {
    return reply.code(400).send({
      message: "Le champ nom doit être une chaîne de caractères",
    });
  }

  // Validation : type du champ code
  if (body.code !== undefined && typeof body.code !== "string") {
    return reply.code(400).send({
      message: "Le champ code doit être une chaîne de caractères",
    });
  }

  // Validation : type du champ duree
  if (
    body.duree !== undefined &&
    (typeof body.duree !== "number" || !Number.isInteger(body.duree))
  ) {
    return reply.code(400).send({
      message: "Le champ duree doit être un entier",
    });
  }

  // Validation : type du champ etape
  if (
    body.etape !== undefined &&
    (typeof body.etape !== "number" || !Number.isInteger(body.etape))
  ) {
    return reply.code(400).send({
      message: "Le champ etape doit être un entier",
    });
  }

  // Validation : type du champ est_harchive
  if (
    body.est_harchive !== undefined &&
    typeof body.est_harchive !== "boolean"
  ) {
    return reply.code(400).send({
      message: "Le champ est_harchive doit être un booléen",
    });
  }

  // Validation : type du champ modifierPar
  if (
    body.modifierPar !== undefined &&
    body.modifierPar !== null &&
    typeof body.modifierPar !== "string"
  ) {
    return reply.code(400).send({
      message: "Le champ modifierPar doit être une chaîne de caractères ou null",
    });
  }

  // Validation : nom vide
  if (body.nom !== undefined && isBlankString(body.nom)) {
    return reply.code(400).send({
      message: "Le champ nom ne peut pas être vide",
    });
  }

  // Validation : code vide
  if (body.code !== undefined && isBlankString(body.code)) {
    return reply.code(400).send({
      message: "Le champ code ne peut pas être vide",
    });
  }

  // Validation : duree <= 0
  if (body.duree !== undefined && body.duree <= 0) {
    return reply.code(400).send({
      message: "Le champ duree doit être supérieur à 0",
    });
  }

  // Validation : etape <= 0
  if (body.etape !== undefined && body.etape <= 0) {
    return reply.code(400).send({
      message: "Le champ etape doit être supérieur à 0",
    });
  }

  const payload: UpdateCoursPayload = {};

  if (body.nom !== undefined) {
    payload.nom = normalizeString(body.nom);
  }

  if (body.code !== undefined) {
    payload.code = normalizeString(body.code);
  }

  if (body.duree !== undefined) {
    payload.duree = body.duree;
  }

  if (body.etape !== undefined) {
    payload.etape = body.etape;
  }

  if (body.est_harchive !== undefined) {
    payload.est_harchive = body.est_harchive;
  }

  if (body.modifierPar !== undefined) {
    payload.modifierPar = normalizeNullableString(body.modifierPar);
  }

  try {
    const coursExistant = await getCoursById(request.server, id);

    if (!coursExistant) {
      return reply.code(404).send({
        message: "Cours introuvable",
      });
    }

    const cours = await updateCours(request.server, id, payload);

    return reply.send({
      message: "Cours modifié avec succès",
      data: cours,
    });
  } catch (error) {
    request.log.error(error);

    if (isPrismaKnownError(error)) {
      if (error.code === "P2025") {
        return reply.code(404).send({
          message: "Cours introuvable",
        });
      }

      if (error.code === "P2002") {
        return reply.code(409).send({
          message: "Un cours avec ce code existe déjà",
        });
      }
    }

    return reply.code(500).send({
      message: "Erreur interne du serveur",
    });
  }
}

/*
================================
API : DELETE COURS
================================
*/
export async function removeCours(
  request: FastifyRequest<{
    Params: CoursParams;
    Body: DeleteCoursBody;
  }>,
  reply: FastifyReply
) {
  const id = parseId(request.params.id);

  if (!id) {
    return reply.code(400).send({
      message: "Identifiant du cours invalide",
    });
  }

  const body = request.body ?? {};

  // Validation : type du champ supprimePar
  if (
    body.supprimePar !== undefined &&
    body.supprimePar !== null &&
    typeof body.supprimePar !== "string"
  ) {
    return reply.code(400).send({
      message: "Le champ supprimePar doit être une chaîne de caractères ou null",
    });
  }

  const supprimePar =
    body.supprimePar !== undefined
      ? normalizeNullableString(body.supprimePar)
      : undefined;

  try {
    const coursExistant = await getCoursById(request.server, id);

    if (!coursExistant) {
      return reply.code(404).send({
        message: "Cours introuvable",
      });
    }

    const cours = await softDeleteCours(request.server, id, supprimePar);

    return reply.send({
      message: "Cours supprimé avec succès",
      data: cours,
    });
  } catch (error) {
    request.log.error(error);

    if (isPrismaKnownError(error) && error.code === "P2025") {
      return reply.code(404).send({
        message: "Cours introuvable",
      });
    }

    return reply.code(500).send({
      message: "Erreur interne du serveur",
    });
  }
}