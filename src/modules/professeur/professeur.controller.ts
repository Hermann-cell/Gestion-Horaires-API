import { FastifyReply, FastifyRequest } from "fastify";
import {
  getProfesseurById,
  getProfesseurSimpleById,
  updateProfesseur,
  softDeleteProfesseur,
  isPrismaKnownError,
  createProfesseur,
  getAllProfesseurs,
} from "./professeur.service.js";

import type {
  UpdateProfesseurPayload,
  CreateProfesseurPayload,
} from "./professeur.service.js";

type CreateProfesseurBody = {
  nom: string;
  prenom: string;
};

type ProfesseurParams = {
  id: string;
};

type UpdateProfesseurBody = {
  nom?: string;
  prenom?: string;
  matricule?: string;
  modifierPar?: string | null;
};

type DeleteProfesseurBody = {
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

function normalizeNullableString(value: unknown): string | null {
  if (value === null) return null;
  return typeof value === "string" ? value.trim() : null;
}

function normalizeString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/*
================================
API : CREATE PROFESSEUR
================================
*/
export async function createProfesseurController(
  request: FastifyRequest<{ Body: CreateProfesseurBody }>,
  reply: FastifyReply
) {
  try {
    const body = request.body;

    if (!body) {
      return reply.code(400).send({
        message: "Le corps de la requête est obligatoire",
      });
    }

    const { nom, prenom, matricule } = body;

    if (!nom || nom.trim() === "") {
      return reply.code(400).send({ message: "Le nom est obligatoire" });
    }

    if (!prenom || prenom.trim() === "") {
      return reply.code(400).send({ message: "Le prénom est obligatoire" });
    }

    const payload: CreateProfesseurPayload = {
      nom: nom.trim(),
      prenom: prenom.trim(),
    };

    const result = await createProfesseur(request.server, payload);

    return reply.code(201).send(result);
  } catch (err: unknown) {
    request.log.error(err);

    if (err instanceof Error && err.message.includes("existe déjà")) {
      return reply.code(409).send({
        message: err.message,
      });
    }

    return reply.code(500).send({
      message: "Erreur lors de la création du professeur",
    });
  }
}

/*
================================
API : GET ALL PROFESSEURS
================================
*/
export async function getAllProfesseursController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const result = await getAllProfesseurs(request.server);
    return reply.send(result);
  } catch (err) {
    request.log.error(err);
    return reply.code(500).send({
      message: "Erreur lors de la récupération des professeurs",
    });
  }
}

/*
================================
API : GET PROFESSEUR DETAILS
================================
*/
export async function getProfesseur(
  request: FastifyRequest<{ Params: ProfesseurParams }>,
  reply: FastifyReply
) {
  const id = parseId(request.params.id);

  if (!id) {
    return reply.code(400).send({
      message: "Identifiant du professeur invalide",
    });
  }

  try {
    const professeur = await getProfesseurById(request.server, id);

    if (!professeur) {
      return reply.code(404).send({
        message: "Professeur introuvable",
      });
    }

    return reply.send(professeur);
  } catch (error) {
    request.log.error(error);
    console.error("ERREUR GET /professeurs/:id =", error);

    return reply.code(500).send({
      message: "Erreur interne du serveur",
    });
  }
}

/*
================================
API : UPDATE PROFESSEUR
================================
*/
export async function editProfesseur(
  request: FastifyRequest<{
    Params: ProfesseurParams;
    Body: UpdateProfesseurBody;
  }>,
  reply: FastifyReply
) {
  const id = parseId(request.params.id);

  if (!id) {
    return reply.code(400).send({
      message: "Identifiant du professeur invalide",
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

  if (body.prenom !== undefined && typeof body.prenom !== "string") {
    return reply.code(400).send({
      message: "Le champ prenom doit être une chaîne de caractères",
    });
  }

  if (body.matricule !== undefined && typeof body.matricule !== "string") {
    return reply.code(400).send({
      message: "Le champ matricule doit être une chaîne de caractères",
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

  if (body.prenom !== undefined && isBlankString(body.prenom)) {
    return reply.code(400).send({
      message: "Le champ prenom ne peut pas être vide",
    });
  }

  if (body.matricule !== undefined && isBlankString(body.matricule)) {
    return reply.code(400).send({
      message: "Le champ matricule ne peut pas être vide",
    });
  }

  const payload: UpdateProfesseurPayload = {};

  if (body.nom !== undefined) {
    payload.nom = normalizeString(body.nom);
  }

  if (body.prenom !== undefined) {
    payload.prenom = normalizeString(body.prenom);
  }

  if (body.modifierPar !== undefined) {
    payload.modifierPar = normalizeNullableString(body.modifierPar);
  }

  try {
    const professeurExistant = await getProfesseurSimpleById(request.server, id);

    if (!professeurExistant) {
      return reply.code(404).send({
        message: "Professeur introuvable",
      });
    }

    const professeur = await updateProfesseur(request.server, id, payload);

    return reply.send({
      message: "Professeur modifié avec succès",
      data: professeur,
    });
  } catch (error: unknown) {
    request.log.error(error);
    console.error("ERREUR PUT /professeurs/:id =", error);

    if (isPrismaKnownError(error) && error.code === "P2025") {
      return reply.code(404).send({
        message: "Professeur introuvable",
      });
    }

    if (error instanceof Error && error.message.includes("introuvable")) {
      return reply.code(404).send({
        message: error.message,
      });
    }

    if (error instanceof Error && error.message.includes("existe déjà")) {
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
API : DELETE PROFESSEUR
================================
*/
export async function removeProfesseur(
  request: FastifyRequest<{
    Params: ProfesseurParams;
    Body: DeleteProfesseurBody;
  }>,
  reply: FastifyReply
) {
  const id = parseId(request.params.id);

  if (!id) {
    return reply.code(400).send({
      message: "Identifiant du professeur invalide",
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
    const professeurExistant = await getProfesseurSimpleById(request.server, id);

    if (!professeurExistant) {
      return reply.code(404).send({
        message: "Professeur introuvable",
      });
    }

    const professeur = await softDeleteProfesseur(
      request.server,
      id,
      supprimePar
    );

    if (!professeur) {
      return reply.code(404).send({
        message: "Professeur introuvable",
      });
    }

    return reply.send({
      message: "Professeur supprimé avec succès",
      data: professeur,
    });
  } catch (error: unknown) {
    request.log.error(error);
    console.error("ERREUR DELETE /professeurs/:id =", error);

    if (isPrismaKnownError(error) && error.code === "P2025") {
      return reply.code(404).send({
        message: "Professeur introuvable",
      });
    }

    if (error instanceof Error && error.message.includes("introuvable")) {
      return reply.code(404).send({
        message: error.message,
      });
    }

    if (
      error instanceof Error &&
      error.message.includes("affecté à une séance")
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