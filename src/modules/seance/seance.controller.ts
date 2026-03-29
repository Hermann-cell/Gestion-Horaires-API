import { FastifyReply, FastifyRequest } from "fastify";
import {
  createSeance,
  getAllSeances,
  getSeanceById,
  updateSeance,
  softDeleteSeance,
  getCoursActifById,
  getSalleActiveById,
  getPlageHoraireActiveById,
  getProfesseurActifById,
  findSalleConflict,
  findProfesseurConflict,
  isPrismaKnownError,
  type CreateSeancePayload,
  type UpdateSeancePayload,
} from "./seance.service.js";

type SeanceParams = {
  id: string;
};

type CreateSeanceBody = {
  date: string;
  coursId: number;
  salleId: number;
  plageHoraireId: number;
  creerPar?: string | null;
};

type UpdateSeanceBody = {
  date?: string;
  coursId?: number;
  salleId?: number;
  plageHoraireId?: number;
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

function getFrenchDayName(date: Date): string {
  const jours = [
    "dimanche",
    "lundi",
    "mardi",
    "mercredi",
    "jeudi",
    "vendredi",
    "samedi",
  ] as const;

  return jours[date.getUTCDay()] ?? "inconnu";
}

function professeurHasRequiredSpecialite(
  professeur: Awaited<ReturnType<typeof getProfesseurActifById>>,
  requiredSpecialiteId: number
): boolean {
  if (!professeur) return false;

  return professeur.specialite_professeurs.some((sp) => {
    return sp.specialiteId === requiredSpecialiteId;
  });
}

function professeurIsAvailableForDay(
  professeur: Awaited<ReturnType<typeof getProfesseurActifById>>,
  dayName: string
): boolean {
  if (!professeur) return false;

  return professeur.disponibilite_professeurs.some((dp) => {
    return (
      dp.disponibilite.supprimeLe === null &&
      dp.disponibilite.jour.trim().toLowerCase() === dayName
    );
  });
}

function professeurIsAvailableForPlageHoraire(
  professeur: Awaited<ReturnType<typeof getProfesseurActifById>>,
  dayName: string,
  plageHoraireId: number
): boolean {
  if (!professeur) return false;

  return professeur.disponibilite_professeurs.some((dp) => {
    const disponibilite = dp.disponibilite;

    if (
      disponibilite.supprimeLe !== null ||
      disponibilite.jour.trim().toLowerCase() !== dayName
    ) {
      return false;
    }

    return disponibilite.plageHoraire_Disponibilites.some((phd) => {
      return (
        phd.supprimeLe === null &&
        phd.plageHoraireId === plageHoraireId &&
        phd.plageHoraire.supprimeLe === null
      );
    });
  });
}

/*
================================
API : CREATE SEANCE
Affectation d’un cours à une salle,
une date et une plage horaire
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
    const date = new Date(body.date);

    const cours = await getCoursActifById(request.server, body.coursId);
    if (!cours) {
      return reply.code(404).send({
        message: "Cours introuvable",
      });
    }

    const salle = await getSalleActiveById(request.server, body.salleId);
    if (!salle) {
      return reply.code(404).send({
        message: "Salle introuvable",
      });
    }

    const plageHoraire = await getPlageHoraireActiveById(
      request.server,
      body.plageHoraireId
    );
    if (!plageHoraire) {
      return reply.code(404).send({
        message: "Plage horaire introuvable",
      });
    }

    if (!cours.typeDeSalleId) {
      return reply.code(409).send({
        message: "Le cours n'a pas de type de salle défini",
      });
    }

    if (salle.typeDeSalleId !== cours.typeDeSalleId) {
      return reply.code(409).send({
        message: "La salle n'est pas compatible avec le type requis du cours",
      });
    }

    const salleConflict = await findSalleConflict(request.server, {
      date,
      salleId: body.salleId,
      plageHoraireId: body.plageHoraireId,
    });

    if (salleConflict) {
      return reply.code(409).send({
        message:
          "La salle est déjà occupée pour cette date et cette plage horaire",
      });
    }

    const payload: CreateSeancePayload = {
      date,
      coursId: body.coursId,
      salleId: body.salleId,
      plageHoraireId: body.plageHoraireId,
    };

    if (body.creerPar !== undefined) {
      payload.creerPar = normalizeNullableString(body.creerPar);
    }

    const seance = await createSeance(request.server, payload);

    return reply.code(201).send({
      message: "Séance créée avec succès",
      data: seance,
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

    const finalDate =
      body.date !== undefined ? new Date(body.date) : seanceExistante.date;
    const finalCoursId =
      body.coursId !== undefined ? body.coursId : seanceExistante.coursId;
    const finalSalleId =
      body.salleId !== undefined ? body.salleId : seanceExistante.salleId;
    const finalPlageHoraireId =
      body.plageHoraireId !== undefined
        ? body.plageHoraireId
        : seanceExistante.plageHoraireId;

    const cours = await getCoursActifById(request.server, finalCoursId);
    if (!cours) {
      return reply.code(404).send({
        message: "Cours introuvable",
      });
    }

    const salle = await getSalleActiveById(request.server, finalSalleId);
    if (!salle) {
      return reply.code(404).send({
        message: "Salle introuvable",
      });
    }

    const plageHoraire = await getPlageHoraireActiveById(
      request.server,
      finalPlageHoraireId
    );
    if (!plageHoraire) {
      return reply.code(404).send({
        message: "Plage horaire introuvable",
      });
    }

    if (!cours.typeDeSalleId) {
      return reply.code(409).send({
        message: "Le cours n'a pas de type de salle défini",
      });
    }

    if (salle.typeDeSalleId !== cours.typeDeSalleId) {
      return reply.code(409).send({
        message: "La salle n'est pas compatible avec le type requis du cours",
      });
    }

    const salleConflict = await findSalleConflict(request.server, {
      date: finalDate,
      salleId: finalSalleId,
      plageHoraireId: finalPlageHoraireId,
      excludeSeanceId: id,
    });

    if (salleConflict) {
      return reply.code(409).send({
        message:
          "La salle est déjà occupée pour cette date et cette plage horaire",
      });
    }

    const payload: UpdateSeancePayload = {};

    if (body.date !== undefined) payload.date = finalDate;
    if (body.coursId !== undefined) payload.coursId = body.coursId;
    if (body.salleId !== undefined) payload.salleId = body.salleId;
    if (body.plageHoraireId !== undefined) {
      payload.plageHoraireId = body.plageHoraireId;
    }
    if (body.modifierPar !== undefined) {
      payload.modifierPar = normalizeNullableString(body.modifierPar);
    }

    const seance = await updateSeance(request.server, id, payload);

    return reply.send({
      message: "Séance modifiée avec succès",
      data: seance,
    });
  } catch (error) {
    request.log.error(error);

    if (isPrismaKnownError(error) && error.code === "P2025") {
      return reply.code(404).send({
        message: "Séance introuvable",
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

    const professeur = await getProfesseurActifById(
      request.server,
      body.professeurId
    );

    if (!professeur) {
      return reply.code(404).send({
        message: "Professeur introuvable",
      });
    }

    if (!seance.cours.specialiteId) {
      return reply.code(409).send({
        message: "Le cours de cette séance n'a pas de spécialité définie",
      });
    }

    if (
      !professeurHasRequiredSpecialite(professeur, seance.cours.specialiteId)
    ) {
      return reply.code(409).send({
        message:
          "La spécialité du professeur ne correspond pas au cours concerné",
      });
    }

    const professeurConflict = await findProfesseurConflict(request.server, {
      date: seance.date,
      professeurId: body.professeurId,
      plageHoraireId: seance.plageHoraireId,
      excludeSeanceId: id,
    });

    if (professeurConflict) {
      return reply.code(409).send({
        message:
          "Le professeur est déjà affecté à une autre séance pour cette date et cette plage horaire",
      });
    }

    const dayName = getFrenchDayName(seance.date);

    if (!professeurIsAvailableForDay(professeur, dayName)) {
      return reply.code(409).send({
        message: `Le professeur n'est pas disponible le ${dayName}`,
      });
    }

    if (
      !professeurIsAvailableForPlageHoraire(
        professeur,
        dayName,
        seance.plageHoraireId
      )
    ) {
      return reply.code(409).send({
        message:
          "Le professeur n'est pas disponible sur cette plage horaire pour ce jour",
      });
    }

    const payload: UpdateSeancePayload = {
      professeurId: body.professeurId,
    };

    if (body.modifierPar !== undefined) {
      payload.modifierPar = normalizeNullableString(body.modifierPar);
    }

    const updatedSeance = await updateSeance(request.server, id, payload);

    return reply.send({
      message: "Professeur affecté à la séance avec succès",
      data: updatedSeance,
    });
  } catch (error) {
    request.log.error(error);

    if (isPrismaKnownError(error) && error.code === "P2025") {
      return reply.code(404).send({
        message: "Séance introuvable",
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
  } catch (error) {
    request.log.error(error);

    if (isPrismaKnownError(error) && error.code === "P2025") {
      return reply.code(404).send({
        message: "Séance introuvable",
      });
    }

    return reply.code(500).send({
      message: "Erreur interne du serveur",
    });
  }
}