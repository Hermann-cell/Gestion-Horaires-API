import { FastifyReply, FastifyRequest } from "fastify";
import {
  createCours,
  getAllCours,
  getCoursById,
  updateCours,
  softDeleteCours,
  isPrismaKnownError,
} from "./cours.service.js";

import type {
  CreateCoursPayload,
  UpdateCoursPayload,
} from "./cours.service.js";

/*
================================
TYPES
================================
*/
type CoursParams = { id: string };

type CreateCoursBody = {
  nom: string;
  code: string;
  duree: number;
  etape: number;
  specialiteId?: number | null;
  typeDeSalleId?: number | null;
  creerPar?: string | null;
};

type UpdateCoursBody = {
  nom?: string;
  code?: string;
  duree?: number;
  etape?: number;
  specialiteId?: number | null;
  typeDeSalleId?: number | null;
  est_harchive?: boolean;
  modifierPar?: string | null;
};

type DeleteCoursBody = {
  supprimePar?: string | null;
};

/*
================================
UTILS
================================
*/
function parseId(id: string): number | null {
  const n = Number(id);
  return Number.isInteger(n) && n > 0 ? n : null;
}

function trim(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function trimNullable(value: unknown): string | null {
  if (value === null) return null;
  return typeof value === "string" ? value.trim() : null;
}

function isBlankString(value: unknown): boolean {
  return typeof value === "string" && value.trim() === "";
}

/*
================================
CREATE
================================
*/
export async function addCours(
  request: FastifyRequest<{ Body: CreateCoursBody }>,
  reply: FastifyReply
) {
  try {
    const b = request.body;

    if (!b) {
      return reply
        .code(400)
        .send({ message: "Le corps de la requête est obligatoire" });
    }

    if (!b.nom || b.nom.trim() === "") {
      return reply.code(400).send({ message: "Nom requis" });
    }

    if (!b.code || b.code.trim() === "") {
      return reply.code(400).send({ message: "Code requis" });
    }

    if (!Number.isInteger(b.duree) || b.duree <= 0) {
      return reply.code(400).send({ message: "Durée invalide" });
    }

    if (!Number.isInteger(b.etape) || b.etape <= 0) {
      return reply.code(400).send({ message: "Étape invalide" });
    }

    if (
      b.specialiteId !== undefined &&
      b.specialiteId !== null &&
      (!Number.isInteger(b.specialiteId) || b.specialiteId <= 0)
    ) {
      return reply.code(400).send({ message: "Spécialité invalide" });
    }

    if (
      b.typeDeSalleId !== undefined &&
      b.typeDeSalleId !== null &&
      (!Number.isInteger(b.typeDeSalleId) || b.typeDeSalleId <= 0)
    ) {
      return reply.code(400).send({ message: "Type de salle invalide" });
    }

    const payload: CreateCoursPayload = {
      nom: trim(b.nom),
      code: trim(b.code),
      duree: b.duree,
      etape: b.etape,
      ...(b.specialiteId !== undefined ? { specialiteId: b.specialiteId } : {}),
      ...(b.typeDeSalleId !== undefined ? { typeDeSalleId: b.typeDeSalleId } : {}),
      ...(b.creerPar !== undefined ? { creerPar: trimNullable(b.creerPar) } : {}),
    };

    const cours = await createCours(request.server, payload);

    return reply.code(201).send({
      message: "Cours créé",
      data: cours,
    });
  } catch (error: unknown) {
    request.log.error(error);

    if (isPrismaKnownError(error) && error.code === "P2002") {
      return reply.code(409).send({ message: "Code déjà utilisé" });
    }

    if (error instanceof Error && error.message.includes("existe déjà")) {
      return reply.code(409).send({ message: error.message });
    }

    if (error instanceof Error && error.message.includes("introuvable")) {
      return reply.code(404).send({ message: error.message });
    }

    return reply.code(500).send({ message: "Erreur serveur" });
  }
}

/*
================================
GET ALL
================================
*/
export async function listCours(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const data = await getAllCours(request.server);
    return reply.send({ data });
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ message: "Erreur serveur" });
  }
}

/*
================================
GET BY ID
================================
*/
export async function getCours(
  request: FastifyRequest<{ Params: CoursParams }>,
  reply: FastifyReply
) {
  const id = parseId(request.params.id);

  if (!id) {
    return reply.code(400).send({ message: "ID invalide" });
  }

  try {
    const cours = await getCoursById(request.server, id);

    if (!cours) {
      return reply.code(404).send({ message: "Cours introuvable" });
    }

    return reply.send({ data: cours });
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ message: "Erreur serveur" });
  }
}

/*
================================
UPDATE
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
    return reply.code(400).send({ message: "ID invalide" });
  }

  const body = request.body ?? {};

  if (Object.keys(body).length === 0) {
    return reply.code(400).send({ message: "Aucune donnée à modifier" });
  }

  if (body.nom !== undefined && typeof body.nom !== "string") {
    return reply
      .code(400)
      .send({ message: "Le champ nom doit être une chaîne de caractères" });
  }

  if (body.code !== undefined && typeof body.code !== "string") {
    return reply
      .code(400)
      .send({ message: "Le champ code doit être une chaîne de caractères" });
  }

  if (
    body.duree !== undefined &&
    (!Number.isInteger(body.duree) || body.duree <= 0)
  ) {
    return reply.code(400).send({ message: "Durée invalide" });
  }

  if (
    body.etape !== undefined &&
    (!Number.isInteger(body.etape) || body.etape <= 0)
  ) {
    return reply.code(400).send({ message: "Étape invalide" });
  }

  if (
    body.specialiteId !== undefined &&
    body.specialiteId !== null &&
    (!Number.isInteger(body.specialiteId) || body.specialiteId <= 0)
  ) {
    return reply.code(400).send({ message: "Spécialité invalide" });
  }

  if (
    body.typeDeSalleId !== undefined &&
    body.typeDeSalleId !== null &&
    (!Number.isInteger(body.typeDeSalleId) || body.typeDeSalleId <= 0)
  ) {
    return reply.code(400).send({ message: "Type de salle invalide" });
  }

  if (
    body.est_harchive !== undefined &&
    typeof body.est_harchive !== "boolean"
  ) {
    return reply
      .code(400)
      .send({ message: "Le champ est_harchive doit être un booléen" });
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

  if (body.nom !== undefined && isBlankString(body.nom)) {
    return reply
      .code(400)
      .send({ message: "Le champ nom ne peut pas être vide" });
  }

  if (body.code !== undefined && isBlankString(body.code)) {
    return reply
      .code(400)
      .send({ message: "Le champ code ne peut pas être vide" });
  }

  const payload: UpdateCoursPayload = {
    ...(body.nom !== undefined ? { nom: trim(body.nom) } : {}),
    ...(body.code !== undefined ? { code: trim(body.code) } : {}),
    ...(body.duree !== undefined ? { duree: body.duree } : {}),
    ...(body.etape !== undefined ? { etape: body.etape } : {}),
    ...(body.specialiteId !== undefined ? { specialiteId: body.specialiteId } : {}),
    ...(body.typeDeSalleId !== undefined ? { typeDeSalleId: body.typeDeSalleId } : {}),
    ...(body.est_harchive !== undefined ? { est_harchive: body.est_harchive } : {}),
    ...(body.modifierPar !== undefined
      ? { modifierPar: trimNullable(body.modifierPar) }
      : {}),
  };

  try {
    const existing = await getCoursById(request.server, id);

    if (!existing) {
      return reply.code(404).send({ message: "Cours introuvable" });
    }

    const cours = await updateCours(request.server, id, payload);

    return reply.send({
      message: "Cours modifié",
      data: cours,
    });
  } catch (error: unknown) {
    request.log.error(error);

    if (isPrismaKnownError(error) && error.code === "P2002") {
      return reply.code(409).send({ message: "Code déjà utilisé" });
    }

    if (error instanceof Error && error.message.includes("introuvable")) {
      return reply.code(404).send({ message: error.message });
    }

    if (error instanceof Error && error.message.includes("existe déjà")) {
      return reply.code(409).send({ message: error.message });
    }

    return reply.code(500).send({ message: "Erreur serveur" });
  }
}

/*
================================
DELETE
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
    return reply.code(400).send({ message: "ID invalide" });
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

  const supprimePar =
    body.supprimePar !== undefined
      ? trimNullable(body.supprimePar)
      : undefined;

  try {
    const existing = await getCoursById(request.server, id);

    if (!existing) {
      return reply.code(404).send({ message: "Cours introuvable" });
    }

    const cours = await softDeleteCours(request.server, id, supprimePar);

    return reply.send({
      message: "Cours supprimé",
      data: cours,
    });
  } catch (error: unknown) {
    request.log.error(error);

    if (error instanceof Error && error.message.includes("introuvable")) {
      return reply.code(404).send({ message: error.message });
    }

    if (
      error instanceof Error &&
      error.message.includes("affecté à une séance")
    ) {
      return reply.code(409).send({ message: error.message });
    }

    return reply.code(500).send({ message: "Erreur serveur" });
  }
}