import { FastifyReply, FastifyRequest } from "fastify";
import {
  createSeance,
  getAllSeances,
  getSeanceById,
  updateSeance,
  softDeleteSeance,
  isPrismaKnownError,
} from "./seance.service.js";

import type {
  CreateSeancePayload,
  UpdateSeancePayload,
} from "./seance.service.js";

type SeanceParams = {
  id: string;
};

type CreateSeanceBody = {
  date: string;
  coursId: number;
  salleId: number;
  plageHoraireId: number;
  professeurId?: number | null;
  creerPar?: string | null;
};

type UpdateSeanceBody = {
  date?: string;
  coursId?: number;
  salleId?: number;
  plageHoraireId?: number;
  professeurId?: number | null;
  modifierPar?: string | null;
};

type DeleteSeanceBody = {
  supprimePar?: string | null;
};

type AffectProfesseurBody = {
  professeurId: number;
  modifierPar?: string | null;
};

function parseId(id: string): number | null {
  const parsedId = Number(id);

  if (!Number.isInteger(parsedId) || parsedId <= 0) {
    return null;
  }

  return parsedId;
}

function isPositiveInteger(value: unknown): boolean {
  return typeof value === "number" && Number.isInteger(value) && value > 0;
}

function isBlankString(value: unknown): boolean {
  return typeof value === "string" && value.trim() === "";
}

function normalizeNullableString(value: unknown): string | null {
  if (value === null) return null;
  return typeof value === "string" ? value.trim() : null;
}

function isValidDateString(value: unknown): boolean {
  if (typeof value !== "string") return false;
  return !Number.isNaN(new Date(value).getTime());
}

/*
================================
API : CREATE SEANCE
================================
*/
export async function addSeance(
  request: FastifyRequest<{ Body: CreateSeanceBody }>,
  reply: FastifyReply
) {
  const body = request.body;

  if (!body) {
    return reply.code(400).send({
      message: "Données manquantes",
    });
  }

  if (!isValidDateString(body.date)) {
    return reply.code(400).send({
      message: "Le champ date est requis et doit être une date valide",
    });
  }

  if (!isPositiveInteger(body.coursId)) {
    return reply.code(400).send({
      message: "Le champ coursId doit être un entier positif",
    });
  }

  if (!isPositiveInteger(body.salleId)) {
    return reply.code(400).send({
      message: "Le champ salleId doit être un entier positif",
    });
  }

  if (!isPositiveInteger(body.plageHoraireId)) {
    return reply.code(400).send({
      message: "Le champ plageHoraireId doit être un entier positif",
    });
  }

  if (
    body.professeurId !== undefined &&
    body.professeurId !== null &&
    !isPositiveInteger(body.professeurId)
  ) {
    return reply.code(400).send({
      message: "Le champ professeurId doit être un entier positif ou null",
    });
  }

  if (
    body.creerPar !== undefined &&
    body.creerPar !== null &&
    typeof body.creerPar !== "string"
  ) {
    return reply.code(400).send({
      message: "Le champ creerPar doit être une chaîne de caractères ou null",
    });
  }

  if (
    body.creerPar !== undefined &&
    body.creerPar !== null &&
    isBlankString(body.creerPar)
  ) {
    return reply.code(400).send({
      message: "Le champ creerPar ne peut pas être vide",
    });
  }

  try {
    const payload: CreateSeancePayload = {
      date: new Date(body.date),
      coursId: body.coursId,
      salleId: body.salleId,
      plageHoraireId: body.plageHoraireId,
      ...(body.professeurId !== undefined ? { professeurId: body.professeurId } : {}),
      ...(body.creerPar !== undefined
        ? { creerPar: normalizeNullableString(body.creerPar) }
        : {}),
    };

    const seance = await createSeance(request.server, payload);

    return reply.code(201).send({
      message: "Séance créée avec succès",
      data: seance,
    });
  } catch (error: unknown) {
    request.log.error(error);

    if (error instanceof Error && error.message.includes("introuvable")) {
      return reply.code(404).send({
        message: error.message,
      });
    }

    if (
      error instanceof Error &&
      (
        error.message.includes("compatible") ||
        error.message.includes("occupée") ||
        error.message.includes("disponible") ||
        error.message.includes("spécialité") ||
        error.message.includes("affecté à une autre séance")
      )
    ) {
      return reply.code(409).send({
        message: error.message,
      });
    }

    return reply.code(500).send({
      message: "Erreur interne du serveur",
    });
  }
}

/*
================================
API : GET ALL SEANCES
================================
*/
export async function getSeances(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const seances = await getAllSeances(request.server);

    return reply.send({
      message: "Liste des séances récupérée avec succès",
      data: seances,
    });
  } catch (error) {
    request.log.error(error);

    return reply.code(500).send({
      message: "Erreur interne du serveur",
    });
  }
}

/*
================================
API : GET SEANCE DETAILS
================================
*/
export async function getSeance(
  request: FastifyRequest<{ Params: SeanceParams }>,
  reply: FastifyReply
) {
  const id = parseId(request.params.id);

  if (!id) {
    return reply.code(400).send({
      message: "Identifiant de la séance invalide",
    });
  }

  try {
    const seance = await getSeanceById(request.server, id);

    if (!seance) {
      return reply.code(404).send({
        message: "Séance introuvable",
      });
    }

    return reply.send(seance);
  } catch (error) {
    request.log.error(error);

    return reply.code(500).send({
      message: "Erreur interne du serveur",
    });
  }
}

/*
================================
API : UPDATE SEANCE
================================
*/
export async function editSeance(
  request: FastifyRequest<{
    Params: SeanceParams;
    Body: UpdateSeanceBody;
  }>,
  reply: FastifyReply
) {
  const id = parseId(request.params.id);

  if (!id) {
    return reply.code(400).send({
      message: "Identifiant de la séance invalide",
    });
  }

  const body = request.body ?? {};

  if (Object.keys(body).length === 0) {
    return reply.code(400).send({
      message: "Aucune donnée à modifier",
    });
  }

  if (body.date !== undefined && !isValidDateString(body.date)) {
    return reply.code(400).send({
      message: "Le champ date doit être une date valide",
    });
  }

  if (body.coursId !== undefined && !isPositiveInteger(body.coursId)) {
    return reply.code(400).send({
      message: "Le champ coursId doit être un entier positif",
    });
  }

  if (body.salleId !== undefined && !isPositiveInteger(body.salleId)) {
    return reply.code(400).send({
      message: "Le champ salleId doit être un entier positif",
    });
  }

  if (
    body.plageHoraireId !== undefined &&
    !isPositiveInteger(body.plageHoraireId)
  ) {
    return reply.code(400).send({
      message: "Le champ plageHoraireId doit être un entier positif",
    });
  }

  if (
    body.professeurId !== undefined &&
    body.professeurId !== null &&
    !isPositiveInteger(body.professeurId)
  ) {
    return reply.code(400).send({
      message: "Le champ professeurId doit être un entier positif ou null",
    });
  }

  if (
    body.modifierPar !== undefined &&
    body.modifierPar !== null &&
    typeof body.modifierPar !== "string"
  ) {
    return reply.code(400).send({
      message: "Le champ modifierPar doit être une chaîne de caractères ou null",
    });
  }

  if (
    body.modifierPar !== undefined &&
    body.modifierPar !== null &&
    isBlankString(body.modifierPar)
  ) {
    return reply.code(400).send({
      message: "Le champ modifierPar ne peut pas être vide",
    });
  }

  try {
    const seanceExistante = await getSeanceById(request.server, id);

    if (!seanceExistante) {
      return reply.code(404).send({
        message: "Séance introuvable",
      });
    }

    const payload: UpdateSeancePayload = {
      ...(body.date !== undefined ? { date: new Date(body.date) } : {}),
      ...(body.coursId !== undefined ? { coursId: body.coursId } : {}),
      ...(body.salleId !== undefined ? { salleId: body.salleId } : {}),
      ...(body.plageHoraireId !== undefined
        ? { plageHoraireId: body.plageHoraireId }
        : {}),
      ...(body.professeurId !== undefined
        ? { professeurId: body.professeurId }
        : {}),
      ...(body.modifierPar !== undefined
        ? { modifierPar: normalizeNullableString(body.modifierPar) }
        : {}),
    };

    const seance = await updateSeance(request.server, id, payload);

    return reply.send({
      message: "Séance modifiée avec succès",
      data: seance,
    });
  } catch (error: unknown) {
    request.log.error(error);

    if (isPrismaKnownError(error) && error.code === "P2025") {
      return reply.code(404).send({
        message: "Séance introuvable",
      });
    }

    if (error instanceof Error && error.message.includes("introuvable")) {
      return reply.code(404).send({
        message: error.message,
      });
    }

    if (
      error instanceof Error &&
      (
        error.message.includes("compatible") ||
        error.message.includes("occupée") ||
        error.message.includes("disponible") ||
        error.message.includes("spécialité") ||
        error.message.includes("affecté à une autre séance")
      )
    ) {
      return reply.code(409).send({
        message: error.message,
      });
    }

    return reply.code(500).send({
      message: "Erreur interne du serveur",
    });
  }
}

/*
================================
API : AFFECTER PROFESSEUR A UNE SEANCE
================================
*/
export async function assignProfesseurToSeance(
  request: FastifyRequest<{
    Params: SeanceParams;
    Body: AffectProfesseurBody;
  }>,
  reply: FastifyReply
) {
  const id = parseId(request.params.id);

  if (!id) {
    return reply.code(400).send({
      message: "Identifiant de la séance invalide",
    });
  }

  const body = request.body;

  if (!body) {
    return reply.code(400).send({
      message: "Données manquantes",
    });
  }

  if (!isPositiveInteger(body.professeurId)) {
    return reply.code(400).send({
      message: "Le champ professeurId doit être un entier positif",
    });
  }

  if (
    body.modifierPar !== undefined &&
    body.modifierPar !== null &&
    typeof body.modifierPar !== "string"
  ) {
    return reply.code(400).send({
      message: "Le champ modifierPar doit être une chaîne de caractères ou null",
    });
  }

  if (
    body.modifierPar !== undefined &&
    body.modifierPar !== null &&
    isBlankString(body.modifierPar)
  ) {
    return reply.code(400).send({
      message: "Le champ modifierPar ne peut pas être vide",
    });
  }

  try {
    const seance = await getSeanceById(request.server, id);

    if (!seance) {
      return reply.code(404).send({
        message: "Séance introuvable",
      });
    }

    const payload: UpdateSeancePayload = {
      professeurId: body.professeurId,
      ...(body.modifierPar !== undefined
        ? { modifierPar: normalizeNullableString(body.modifierPar) }
        : {}),
    };

    const updatedSeance = await updateSeance(request.server, id, payload);

    return reply.send({
      message: "Professeur affecté à la séance avec succès",
      data: updatedSeance,
    });
  } catch (error: unknown) {
    request.log.error(error);

    if (isPrismaKnownError(error) && error.code === "P2025") {
      return reply.code(404).send({
        message: "Séance introuvable",
      });
    }

    if (error instanceof Error && error.message.includes("introuvable")) {
      return reply.code(404).send({
        message: error.message,
      });
    }

    if (
      error instanceof Error &&
      (
        error.message.includes("spécialité") ||
        error.message.includes("disponible") ||
        error.message.includes("affecté à une autre séance")
      )
    ) {
      return reply.code(409).send({
        message: error.message,
      });
    }

    return reply.code(500).send({
      message: "Erreur interne du serveur",
    });
  }
}

/*
================================
API : DELETE SEANCE
================================
*/
export async function removeSeance(
  request: FastifyRequest<{
    Params: SeanceParams;
    Body: DeleteSeanceBody;
  }>,
  reply: FastifyReply
) {
  const id = parseId(request.params.id);

  if (!id) {
    return reply.code(400).send({
      message: "Identifiant de la séance invalide",
    });
  }

  const body = request.body ?? {};

  if (
    body.supprimePar !== undefined &&
    body.supprimePar !== null &&
    typeof body.supprimePar !== "string"
  ) {
    return reply.code(400).send({
      message: "Le champ supprimePar doit être une chaîne de caractères ou null",
    });
  }

  if (
    body.supprimePar !== undefined &&
    body.supprimePar !== null &&
    isBlankString(body.supprimePar)
  ) {
    return reply.code(400).send({
      message: "Le champ supprimePar ne peut pas être vide",
    });
  }

  const supprimePar =
    body.supprimePar !== undefined
      ? normalizeNullableString(body.supprimePar)
      : undefined;

  try {
    const seanceExistante = await getSeanceById(request.server, id);

    if (!seanceExistante) {
      return reply.code(404).send({
        message: "Séance introuvable",
      });
    }

    const seance = await softDeleteSeance(request.server, id, supprimePar);

    return reply.send({
      message: "Séance supprimée avec succès",
      data: seance,
    });
  } catch (error: unknown) {
    request.log.error(error);

    if (isPrismaKnownError(error) && error.code === "P2025") {
      return reply.code(404).send({
        message: "Séance introuvable",
      });
    }

    if (error instanceof Error && error.message.includes("introuvable")) {
      return reply.code(404).send({
        message: error.message,
      });
    }

    return reply.code(500).send({
      message: "Erreur interne du serveur",
    });
  }
}