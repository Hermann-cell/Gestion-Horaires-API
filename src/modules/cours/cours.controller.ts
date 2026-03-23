import { FastifyReply, FastifyRequest } from "fastify";
import {
  createCours,
  getAllCours,
  getCoursById,
  updateCours,
  softDeleteCours,
  isPrismaKnownError,
  type CreateCoursPayload,
  type UpdateCoursPayload,
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
  creerPar?: string | null;
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

/*
================================
UTILS
================================
*/
function parseId(id: string): number | null {
  const n = Number(id);
  return Number.isInteger(n) && n > 0 ? n : null;
}

function trim(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function trimNullable(value: unknown) {
  if (value === null) return null;
  return typeof value === "string" ? value.trim() : null;
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
  const b = request.body;

  if (!b.nom?.trim()) {
    return reply.code(400).send({ message: "Nom requis" });
  }

  if (!b.code?.trim()) {
    return reply.code(400).send({ message: "Code requis" });
  }

  if (!Number.isInteger(b.duree) || b.duree <= 0) {
    return reply.code(400).send({ message: "Durée invalide" });
  }

  if (!Number.isInteger(b.etape) || b.etape <= 0) {
    return reply.code(400).send({ message: "Étape invalide" });
  }

  const payload: CreateCoursPayload = {
    nom: trim(b.nom),
    code: trim(b.code),
    duree: b.duree,
    etape: b.etape,
    creerPar: trimNullable(b.creerPar),
  };

  try {
    const cours = await createCours(request.server, payload);

    return reply.code(201).send({
      message: "Cours créé",
      data: cours,
    });
  } catch (error) {
    if (isPrismaKnownError(error) && error.code === "P2002") {
      return reply.code(409).send({ message: "Code déjà utilisé" });
    }

    return reply.code(500).send({ message: "Erreur serveur" });
  }
}

/*
================================
GET ALL
================================
*/
export async function listCours(request: FastifyRequest, reply: FastifyReply) {
  const data = await getAllCours(request.server);
  return reply.send({ data });
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

  const cours = await getCoursById(request.server, id);

  if (!cours) {
    return reply.code(404).send({ message: "Cours introuvable" });
  }

  return reply.send({ data: cours });
}

/*
================================
UPDATE (editCours)
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

  const payload: UpdateCoursPayload = {};

  if (body.nom !== undefined) payload.nom = trim(body.nom);
  if (body.code !== undefined) payload.code = trim(body.code);
  if (body.duree !== undefined) payload.duree = body.duree;
  if (body.etape !== undefined) payload.etape = body.etape;
  if (body.est_harchive !== undefined)
    payload.est_harchive = body.est_harchive;
  if (body.modifierPar !== undefined)
    payload.modifierPar = trimNullable(body.modifierPar);

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
  } catch (error) {
    if (isPrismaKnownError(error)) {
      if (error.code === "P2002") {
        return reply.code(409).send({ message: "Code déjà utilisé" });
      }
    }

    return reply.code(500).send({ message: "Erreur serveur" });
  }
}

/*
================================
DELETE (removeCours)
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

  const supprimePar =
    request.body?.supprimePar !== undefined
      ? trimNullable(request.body.supprimePar)
      : undefined;

  try {
    const existing = await getCoursById(request.server, id);

    if (!existing) {
      return reply.code(404).send({ message: "Cours introuvable" });
    }

    const cours = await softDeleteCours(
      request.server,
      id,
      supprimePar
    );

    return reply.send({
      message: "Cours supprimé",
      data: cours,
    });
  } catch (error) {
    return reply.code(500).send({ message: "Erreur serveur" });
  }
}