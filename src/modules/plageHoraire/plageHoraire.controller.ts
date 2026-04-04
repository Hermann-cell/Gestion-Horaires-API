import { FastifyReply, FastifyRequest } from "fastify";
import {
  createPlageHoraire,
  getAllPlageHoraires,
  getPlageHoraireById,
  updatePlageHoraire,
  softDeletePlageHoraire,
  isPrismaKnownError,
  type CreatePlageHorairePayload,
  type UpdatePlageHorairePayload,
} from "./plageHoraire.service.js";

type PlageHoraireParams = {
  id: string;
};

type CreatePlageHoraireBody = {
  heureDebut: string;
  heureFin: string;
};

type UpdatePlageHoraireBody = {
  heureDebut?: string;
  heureFin?: string;
};

function parseId(id: string): number | null {
  const parsedId = Number(id);

  if (!Number.isInteger(parsedId) || parsedId <= 0) {
    return null;
  }

  return parsedId;
}

function normalizeString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function isValidHourFormat(value: string): boolean {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(value);
}

function hourStringToDate(value: string): Date {
  const parts = value.split(":");

  if (parts.length !== 2) {
    throw new Error("Format d'heure invalide");
  }

  const hours = Number(parts[0]);
  const minutes = Number(parts[1]);

  const date = new Date();
  date.setHours(hours, minutes, 0, 0);

  return date;
}

/*
================================
API : CREATE PLAGE HORAIRE
================================
*/
export async function createPlageHoraireController(
  request: FastifyRequest<{ Body: CreatePlageHoraireBody }>,
  reply: FastifyReply
) {
  try {
    const heureDebut = normalizeString(request.body?.heureDebut);
    const heureFin = normalizeString(request.body?.heureFin);

    if (!heureDebut || !heureFin) {
      return reply.code(400).send({
        message: "Les champs heureDebut et heureFin sont obligatoires",
      });
    }

    if (!isValidHourFormat(heureDebut) || !isValidHourFormat(heureFin)) {
      return reply.code(400).send({
        message: "Le format des heures doit être HH:mm",
      });
    }

    const heureDebutDate = hourStringToDate(heureDebut);
    const heureFinDate = hourStringToDate(heureFin);

    if (heureDebutDate >= heureFinDate) {
      return reply.code(400).send({
        message: "L'heure de début doit être inférieure à l'heure de fin",
      });
    }

    const payload: CreatePlageHorairePayload = {
      heureDebut: heureDebutDate,
      heureFin: heureFinDate,
    };

    const result = await createPlageHoraire(request.server, payload);
    return reply.code(201).send(result);
  } catch (err: any) {
    request.log.error(err);
    return reply.code(400).send({
      message: err.message || "Erreur lors de la création de la plage horaire",
    });
  }
}

/*
================================
API : GET ALL PLAGES HORAIRES
================================
*/
export async function getAllPlageHorairesController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const result = await getAllPlageHoraires(request.server);
    return reply.send(result);
  } catch (err) {
    request.log.error(err);
    return reply.code(500).send({
      message: "Erreur lors de la récupération des plages horaires",
    });
  }
}

/*
================================
API : GET PLAGE HORAIRE DETAILS
================================
*/
export async function getPlageHoraireController(
  request: FastifyRequest<{ Params: PlageHoraireParams }>,
  reply: FastifyReply
) {
  const id = parseId(request.params.id);

  if (!id) {
    return reply.code(400).send({
      message: "Identifiant invalide",
    });
  }

  try {
    const plageHoraire = await getPlageHoraireById(request.server, id);

    if (!plageHoraire) {
      return reply.code(404).send({
        message: "Plage horaire introuvable",
      });
    }

    return reply.send(plageHoraire);
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({
      message: "Erreur interne du serveur",
    });
  }
}

/*
================================
API : UPDATE PLAGE HORAIRE
================================
*/
export async function editPlageHoraireController(
  request: FastifyRequest<{
    Params: PlageHoraireParams;
    Body: UpdatePlageHoraireBody;
  }>,
  reply: FastifyReply
) {
  const id = parseId(request.params.id);

  if (!id) {
    return reply.code(400).send({
      message: "Identifiant invalide",
    });
  }

  const body = request.body ?? {};

  if (Object.keys(body).length === 0) {
    return reply.code(400).send({
      message: "Aucune donnée à modifier",
    });
  }

  const payload: UpdatePlageHorairePayload = {};

  if (body.heureDebut !== undefined) {
    const heureDebut = normalizeString(body.heureDebut);

    if (!heureDebut) {
      return reply.code(400).send({
        message: "Le champ heureDebut ne peut pas être vide",
      });
    }

    if (!isValidHourFormat(heureDebut)) {
      return reply.code(400).send({
        message: "Le format de heureDebut doit être HH:mm",
      });
    }

    payload.heureDebut = hourStringToDate(heureDebut);
  }

  if (body.heureFin !== undefined) {
    const heureFin = normalizeString(body.heureFin);

    if (!heureFin) {
      return reply.code(400).send({
        message: "Le champ heureFin ne peut pas être vide",
      });
    }

    if (!isValidHourFormat(heureFin)) {
      return reply.code(400).send({
        message: "Le format de heureFin doit être HH:mm",
      });
    }

    payload.heureFin = hourStringToDate(heureFin);
  }

  const existing = await getPlageHoraireById(request.server, id);

  if (!existing) {
    return reply.code(404).send({
      message: "Plage horaire introuvable",
    });
  }

  const heureDebutFinale = payload.heureDebut ?? existing.heure_debut;
  const heureFinFinale = payload.heureFin ?? existing.heure_fin;

  if (heureDebutFinale >= heureFinFinale) {
    return reply.code(400).send({
      message: "L'heure de début doit être inférieure à l'heure de fin",
    });
  }

  try {
    const result = await updatePlageHoraire(request.server, id, payload);

    return reply.send({
      message: "Plage horaire modifiée avec succès",
      data: result,
    });
  } catch (error) {
    request.log.error(error);

    if (isPrismaKnownError(error) && error.code === "P2025") {
      return reply.code(404).send({
        message: "Plage horaire introuvable",
      });
    }

    return reply.code(500).send({
      message: "Erreur interne du serveur",
    });
  }
}

/*
================================
API : DELETE PLAGE HORAIRE
================================
*/
export async function removePlageHoraireController(
  request: FastifyRequest<{ Params: PlageHoraireParams }>,
  reply: FastifyReply
) {
  const id = parseId(request.params.id);

  if (!id) {
    return reply.code(400).send({
      message: "Identifiant invalide",
    });
  }

  try {
    const result = await softDeletePlageHoraire(request.server, id);

    if (!result) {
      return reply.code(404).send({
        message: "Plage horaire introuvable",
      });
    }

    return reply.send({
      message: "Plage horaire supprimée avec succès",
      data: result,
    });
  } catch (error) {
    request.log.error(error);

    if (isPrismaKnownError(error) && error.code === "P2025") {
      return reply.code(404).send({
        message: "Plage horaire introuvable",
      });
    }

    return reply.code(500).send({
      message: "Erreur interne du serveur",
    });
  }
}