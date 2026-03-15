import { FastifyReply, FastifyRequest } from "fastify";
import {
  createProgramme,
  getAllProgrammes,
  getProgrammeById,
  updateProgramme,
  softDeleteProgramme,
  isPrismaKnownError,
  type CreateProgrammePayload,
  type UpdateProgrammePayload,
} from "./programme.service.js";

type ProgrammeParams = {
  id: string;
};

type CreateProgrammeBody = {
  nom: string;
  description?: string | null;
  creerPar?: string | null;
};

type UpdateProgrammeBody = {
  nom?: string;
  description?: string | null;
  modifierPar?: string | null;
};

type DeleteProgrammeBody = {
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
API : CREATE PROGRAMME
================================
*/
export async function addProgramme(
  request: FastifyRequest<{ Body: CreateProgrammeBody }>,
  reply: FastifyReply
) {
  const body = request.body;

  if (!body) {
    return reply.code(400).send({
      message: "Données manquantes",
    });
  }

  if (typeof body.nom !== "string") {
    return reply.code(400).send({
      message: "Le champ nom est requis et doit être une chaîne de caractères",
    });
  }

  if (isBlankString(body.nom)) {
    return reply.code(400).send({
      message: "Le champ nom ne peut pas être vide",
    });
  }

  if (
    body.description !== undefined &&
    body.description !== null &&
    typeof body.description !== "string"
  ) {
    return reply.code(400).send({
      message: "Le champ description doit être une chaîne de caractères ou null",
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

  const payload: CreateProgrammePayload = {
    nom: normalizeString(body.nom),
  };

  if (body.description !== undefined) {
    payload.description = normalizeNullableString(body.description);
  }

  if (body.creerPar !== undefined) {
    payload.creerPar = normalizeNullableString(body.creerPar);
  }

  try {
    const programme = await createProgramme(request.server, payload);

    return reply.code(201).send({
      message: "Programme créé avec succès",
      data: programme,
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
API : GET ALL PROGRAMMES
================================
*/
export async function getProgrammes(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const programmes = await getAllProgrammes(request.server);

    return reply.send({
      message: "Liste des programmes récupérée avec succès",
      data: programmes,
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
API : GET PROGRAMME DETAILS
================================
*/
export async function getProgramme(
  request: FastifyRequest<{ Params: ProgrammeParams }>,
  reply: FastifyReply
) {
  const id = parseId(request.params.id);

  if (!id) {
    return reply.code(400).send({
      message: "Identifiant du programme invalide",
    });
  }

  try {
    const programme = await getProgrammeById(request.server, id);

    if (!programme) {
      return reply.code(404).send({
        message: "Programme introuvable",
      });
    }

    return reply.send(programme);
  } catch (error) {
    request.log.error(error);

    return reply.code(500).send({
      message: "Erreur interne du serveur",
    });
  }
}

/*
================================
API : UPDATE PROGRAMME
================================
*/
export async function editProgramme(
  request: FastifyRequest<{
    Params: ProgrammeParams;
    Body: UpdateProgrammeBody;
  }>,
  reply: FastifyReply
) {
  const id = parseId(request.params.id);

  if (!id) {
    return reply.code(400).send({
      message: "Identifiant du programme invalide",
    });
  }

  const body = request.body ?? {};

  if (Object.keys(body).length === 0) {
    return reply.code(400).send({
      message: "Aucune donnée à modifier",
    });
  }

  if (body.nom !== undefined && typeof body.nom !== "string") {
    return reply.code(400).send({
      message: "Le champ nom doit être une chaîne de caractères",
    });
  }

  if (
    body.description !== undefined &&
    body.description !== null &&
    typeof body.description !== "string"
  ) {
    return reply.code(400).send({
      message: "Le champ description doit être une chaîne de caractères ou null",
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

  if (body.nom !== undefined && isBlankString(body.nom)) {
    return reply.code(400).send({
      message: "Le champ nom ne peut pas être vide",
    });
  }

  const payload: UpdateProgrammePayload = {};

  if (body.nom !== undefined) {
    payload.nom = normalizeString(body.nom);
  }

  if (body.description !== undefined) {
    payload.description = normalizeNullableString(body.description);
  }

  if (body.modifierPar !== undefined) {
    payload.modifierPar = normalizeNullableString(body.modifierPar);
  }

  try {
    const programmeExistant = await getProgrammeById(request.server, id);

    if (!programmeExistant) {
      return reply.code(404).send({
        message: "Programme introuvable",
      });
    }

    const programme = await updateProgramme(request.server, id, payload);

    return reply.send({
      message: "Programme modifié avec succès",
      data: programme,
    });
  } catch (error) {
    request.log.error(error);

    if (isPrismaKnownError(error) && error.code === "P2025") {
      return reply.code(404).send({
        message: "Programme introuvable",
      });
    }

    return reply.code(500).send({
      message: "Erreur interne du serveur",
    });
  }
}

/*
================================
API : DELETE PROGRAMME
================================
*/
export async function removeProgramme(
  request: FastifyRequest<{
    Params: ProgrammeParams;
    Body: DeleteProgrammeBody;
  }>,
  reply: FastifyReply
) {
  const id = parseId(request.params.id);

  if (!id) {
    return reply.code(400).send({
      message: "Identifiant du programme invalide",
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

  const supprimePar =
    body.supprimePar !== undefined
      ? normalizeNullableString(body.supprimePar)
      : undefined;

  try {
    const programmeExistant = await getProgrammeById(request.server, id);

    if (!programmeExistant) {
      return reply.code(404).send({
        message: "Programme introuvable",
      });
    }

    const programme = await softDeleteProgramme(
      request.server,
      id,
      supprimePar
    );

    return reply.send({
      message: "Programme supprimé avec succès",
      data: programme,
    });
  } catch (error) {
    request.log.error(error);

    if (isPrismaKnownError(error) && error.code === "P2025") {
      return reply.code(404).send({
        message: "Programme introuvable",
      });
    }

    return reply.code(500).send({
      message: "Erreur interne du serveur",
    });
  }
}