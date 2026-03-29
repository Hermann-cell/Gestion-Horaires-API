import { FastifyInstance } from "fastify";
import { Prisma } from "../../../generated/prisma/client.js";

export type CreateSeancePayload = {
  date: Date;
  coursId: number;
  salleId: number;
  plageHoraireId: number;
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
API SERVICE : CREATE SEANCE
================================
*/
export async function createSeance(
  app: FastifyInstance,
  data: CreateSeancePayload
) {
  return app.prisma.seance.create({
    data: {
      date: data.date,
      coursId: data.coursId,
      salleId: data.salleId,
      plageHoraireId: data.plageHoraireId,
      ...(data.creerPar !== undefined ? { creerPar: data.creerPar } : {}),
    },
    include: {
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
    },
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
    include: {
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
    },
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
    include: {
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
    },
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
  return app.prisma.seance.update({
    where: { id },
    data: {
      ...("date" in data ? { date: data.date } : {}),
      ...("coursId" in data ? { coursId: data.coursId } : {}),
      ...("salleId" in data ? { salleId: data.salleId } : {}),
      ...("plageHoraireId" in data ? { plageHoraireId: data.plageHoraireId } : {}),
      ...("professeurId" in data ? { professeurId: data.professeurId } : {}),
      ...("modifierPar" in data ? { modifierPar: data.modifierPar } : {}),
    },
    include: {
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
    },
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
      disponibilite_professeurs: {
        where: {
          supprimeLe: null,
        },
        include: {
          disponibilite: {
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
      date: params.date,
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
      date: params.date,
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
GESTION DES ERREURS PRISMA
================================
*/
export function isPrismaKnownError(
  error: unknown
): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError;
}