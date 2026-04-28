import { FastifyInstance } from "fastify";
import { Prisma } from "@prisma/client";

export type CreateSeancePayload = {
  date: Date;
  coursId: number;
  salleId: number;
  plageHoraireId: number;
  professeurId?: number | null;
  creerPar?: string | null;
};

export type UpdateSeancePayload = {
  date?: Date;
  coursId?: number;
  salleId?: number;
  plageHoraireId?: number;
  professeurId?: number | null;
  modifierPar?: string | null;
};

/*
================================
HELPER : INCLUDE COMPLET
================================
*/
const seanceInclude = {
  cours: {
    include: {
      specialite: true,
      typeDeSalle: true,
    },
  },
  salle: {
    include: {
      typeDeSalle: true,
    },
  },
  professeur: true,
  plageHoraire: true,
} as const;

function normalizeDate(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/*
================================
API SERVICE : CREATE SEANCE
================================
*/
export async function createSeance(
  app: FastifyInstance,
  data: CreateSeancePayload
) {
  const cours = await getCoursActifById(app, data.coursId);
  if (!cours) {
    throw new Error("Cours introuvable");
  }

  const salle = await getSalleActiveById(app, data.salleId);
  if (!salle) {
    throw new Error("Salle introuvable");
  }

  const plageHoraire = await getPlageHoraireActiveById(app, data.plageHoraireId);
  if (!plageHoraire) {
    throw new Error("Plage horaire introuvable");
  }

  if (
    cours.typeDeSalleId !== null &&
    cours.typeDeSalleId !== undefined &&
    salle.typeDeSalleId !== cours.typeDeSalleId
  ) {
    throw new Error("La salle sélectionnée n'est pas compatible avec le type requis pour ce cours");
  }

  const normalizedDate = normalizeDate(data.date);

  const salleConflict = await findSalleConflict(app, {
    date: normalizedDate,
    salleId: data.salleId,
    plageHoraireId: data.plageHoraireId,
  });

  if (salleConflict) {
    throw new Error("La salle est déjà occupée pour cette date et cette plage horaire");
  }

  if (data.professeurId !== undefined && data.professeurId !== null) {
    const professeur = await getProfesseurActifById(app, data.professeurId);

    if (!professeur) {
      throw new Error("Professeur introuvable");
    }

    if (
      cours.specialiteId !== null &&
      cours.specialiteId !== undefined
    ) {
      const professeurHasSpecialite = professeur.specialite_professeurs.some(
        (sp) => sp.specialiteId === cours.specialiteId && sp.supprimeLe === null
      );

      if (!professeurHasSpecialite) {
        const coursSpecialite = cours.specialite?.nom || "inconnue";
        const professeurSpecialites = professeur.specialite_professeurs
          .filter((sp) => sp.supprimeLe === null)
          .map((sp) => sp.specialite?.nom)
          .join(", ") || "Aucune";
        throw new Error(`Le professeur n'a pas la spécialité requise. Cours: ${coursSpecialite}, Spécialités du professeur: ${professeurSpecialites}`);
      }
    }

    const professeurDisponible = isProfesseurDisponible(
      professeur,
      data.date,
      data.plageHoraireId
    );

    if (!professeurDisponible) {
      throw new Error("Le professeur n'est pas disponible pour cette date et cette plage horaire");
    }

    const professeurConflict = await findProfesseurConflict(app, {
      date: normalizedDate,
      professeurId: data.professeurId,
      plageHoraireId: data.plageHoraireId,
    });

    if (professeurConflict) {
      throw new Error("Le professeur est déjà affecté à une autre séance à cette date et cette plage horaire");
    }
  }

  return app.prisma.seance.create({
    data: {
      date: normalizedDate,
      coursId: data.coursId,
      salleId: data.salleId,
      plageHoraireId: data.plageHoraireId,
      ...(data.professeurId !== undefined ? { professeurId: data.professeurId } : {}),
      ...(data.creerPar !== undefined ? { creerPar: data.creerPar } : {}),
    },
    include: seanceInclude,
  });
}

/*
================================
API SERVICE : GET ALL SEANCES
================================
*/
export async function getAllSeances(app: FastifyInstance) {
  return app.prisma.seance.findMany({
    where: {
      supprimeLe: null,
    },
    include: seanceInclude,
    orderBy: {
      id: "asc",
    },
  });
}

/*
================================
API SERVICE : GET SEANCE BY ID
================================
*/
export async function getSeanceById(app: FastifyInstance, id: number) {
  return app.prisma.seance.findFirst({
    where: {
      id,
      supprimeLe: null,
    },
    include: seanceInclude,
  });
}

/*
================================
API SERVICE : UPDATE SEANCE
================================
*/
export async function updateSeance(
  app: FastifyInstance,
  id: number,
  data: UpdateSeancePayload
) {
  const seance = await getSeanceById(app, id);

  if (!seance) {
    throw new Error("Séance introuvable ou déjà supprimée");
  }

  const finalDate = normalizeDate(data.date ?? seance.date);
  const finalCoursId = data.coursId ?? seance.coursId;
  const finalSalleId = data.salleId ?? seance.salleId;
  const finalPlageHoraireId = data.plageHoraireId ?? seance.plageHoraireId;
  const finalProfesseurId =
    data.professeurId !== undefined ? data.professeurId : seance.professeurId;

  const cours = await getCoursActifById(app, finalCoursId);
  if (!cours) {
    throw new Error("Cours introuvable");
  }

  const salle = await getSalleActiveById(app, finalSalleId);
  if (!salle) {
    throw new Error("Salle introuvable");
  }

  const plageHoraire = await getPlageHoraireActiveById(app, finalPlageHoraireId);
  if (!plageHoraire) {
    throw new Error("Plage horaire introuvable");
  }

  if (
    cours.typeDeSalleId !== null &&
    cours.typeDeSalleId !== undefined &&
    salle.typeDeSalleId !== cours.typeDeSalleId
  ) {
    throw new Error("La salle sélectionnée n'est pas compatible avec le type requis pour ce cours");
  }

  const salleConflict = await findSalleConflict(app, {
    date: finalDate,
    salleId: finalSalleId,
    plageHoraireId: finalPlageHoraireId,
    excludeSeanceId: id,
  });

  if (salleConflict) {
    throw new Error("La salle est déjà occupée pour cette date et cette plage horaire");
  }

  if (finalProfesseurId !== null && finalProfesseurId !== undefined) {
    const professeur = await getProfesseurActifById(app, finalProfesseurId);

    if (!professeur) {
      throw new Error("Professeur introuvable");
    }

    if (
      cours.specialiteId !== null &&
      cours.specialiteId !== undefined
    ) {
      const professeurHasSpecialite = professeur.specialite_professeurs.some(
        (sp) => sp.specialiteId === cours.specialiteId && sp.supprimeLe === null
      );

      if (!professeurHasSpecialite) {
        const coursSpecialite = cours.specialite?.nom || "inconnue";
        const professeurSpecialites = professeur.specialite_professeurs
          .filter((sp) => sp.supprimeLe === null)
          .map((sp) => sp.specialite?.nom)
          .join(", ") || "Aucune";
        throw new Error(`Le professeur n'a pas la spécialité requise. Cours: ${coursSpecialite}, Spécialités du professeur: ${professeurSpecialites}`);
      }
    }

    const professeurDisponible = isProfesseurDisponible(
      professeur,
      finalDate,
      finalPlageHoraireId
    );

    if (!professeurDisponible) {
      throw new Error("Le professeur n'est pas disponible pour cette date et cette plage horaire");
    }

    const professeurConflict = await findProfesseurConflict(app, {
      date: finalDate,
      professeurId: finalProfesseurId,
      plageHoraireId: finalPlageHoraireId,
      excludeSeanceId: id,
    });

    if (professeurConflict) {
      throw new Error("Le professeur est déjà affecté à une autre séance à cette date et cette plage horaire");
    }
  }

  return app.prisma.seance.update({
    where: { id },
    data: {
      ...("date" in data ? { date: normalizeDate(data.date!) } : {}),
      ...("coursId" in data ? { coursId: data.coursId } : {}),
      ...("salleId" in data ? { salleId: data.salleId } : {}),
      ...("plageHoraireId" in data ? { plageHoraireId: data.plageHoraireId } : {}),
      ...("professeurId" in data ? { professeurId: data.professeurId } : {}),
      ...("modifierPar" in data ? { modifierPar: data.modifierPar } : {}),
      modifierLe: new Date(),
    },
    include: seanceInclude,
  });
}

/*
================================
API SERVICE : DELETE SEANCE
================================
*/
export async function softDeleteSeance(
  app: FastifyInstance,
  id: number,
  supprimePar?: string | null
) {
  const seance = await getSeanceById(app, id);

  if (!seance) {
    throw new Error("Séance introuvable ou déjà supprimée");
  }

  return app.prisma.seance.update({
    where: { id },
    data: {
      supprimeLe: new Date(),
      ...(supprimePar !== undefined ? { supprimePar } : {}),
    },
  });
}

/*
================================
VALIDATION DES ENTITES LIEES
================================
*/
export async function getCoursActifById(app: FastifyInstance, id: number) {
  return app.prisma.cours.findFirst({
    where: {
      id,
      supprimeLe: null,
    },
    include: {
      specialite: true,
      typeDeSalle: true,
    },
  });
}

export async function getSalleActiveById(app: FastifyInstance, id: number) {
  return app.prisma.salle.findFirst({
    where: {
      id,
      supprimeLe: null,
    },
    include: {
      typeDeSalle: true,
    },
  });
}

export async function getProfesseurActifById(app: FastifyInstance, id: number) {
  return app.prisma.professeur.findFirst({
    where: {
      id,
      supprimeLe: null,
    },
    include: {
      specialite_professeurs: {
        where: {
          supprimeLe: null,
        },
        include: {
          specialite: true,
        },
      },
      disponibilites: {
        where: {
          supprimeLe: null,
        },
        include: {
          plageHoraire_Disponibilites: {
            where: {
              supprimeLe: null,
            },
            include: {
              plageHoraire: true,
            },
          },
        },
      },
    },
  });
}

export async function getPlageHoraireActiveById(
  app: FastifyInstance,
  id: number
) {
  return app.prisma.plageHoraire.findFirst({
    where: {
      id,
      supprimeLe: null,
    },
  });
}

/*
================================
VERIFICATION : CONFLIT SALLE
================================
*/
export async function findSalleConflict(
  app: FastifyInstance,
  params: {
    date: Date;
    salleId: number;
    plageHoraireId: number;
    excludeSeanceId?: number;
  }
) {
  return app.prisma.seance.findFirst({
    where: {
      supprimeLe: null,
      date: {
        gte: new Date(new Date(params.date).setHours(0, 0, 0, 0)),
        lt: new Date(new Date(params.date).setHours(23, 59, 59, 999)),
      },
      salleId: params.salleId,
      plageHoraireId: params.plageHoraireId,
      ...(params.excludeSeanceId !== undefined
        ? { id: { not: params.excludeSeanceId } }
        : {}),
    },
  });
}


/*
================================
VERIFICATION : CONFLIT PROFESSEUR
================================
*/
export async function findProfesseurConflict(
  app: FastifyInstance,
  params: {
    date: Date;
    professeurId: number;
    plageHoraireId: number;
    excludeSeanceId?: number;
  }
) {
  return app.prisma.seance.findFirst({
    where: {
      supprimeLe: null,
      date: {
        gte: new Date(new Date(params.date).setHours(0, 0, 0, 0)),
        lt: new Date(new Date(params.date).setHours(23, 59, 59, 999)),
      },
      professeurId: params.professeurId,
      plageHoraireId: params.plageHoraireId,
      ...(params.excludeSeanceId !== undefined
        ? { id: { not: params.excludeSeanceId } }
        : {}),
    },
  });
}

/*
================================
HELPER : DISPONIBILITE PROFESSEUR
================================
*/
function isProfesseurDisponible(
  professeur: Awaited<ReturnType<typeof getProfesseurActifById>>,
  date: Date,
  plageHoraireId: number
): boolean {
  if (!professeur) return false;

  const jours = [
    "dimanche",
    "lundi",
    "mardi",
    "mercredi",
    "jeudi",
    "vendredi",
    "samedi",
  ];

  const jour = jours[date.getDay()];

  return professeur.disponibilites.some((disponibilite) => {
    if (disponibilite.supprimeLe !== null) {
      return false;
    }

    const memeJour =
      typeof disponibilite.jour === "string" &&
      disponibilite.jour.trim().toLowerCase() === jour;

    if (!memeJour) {
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
GESTION DES ERREURS PRISMA
================================
*/
export function isPrismaKnownError(
  error: unknown
): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError;
}