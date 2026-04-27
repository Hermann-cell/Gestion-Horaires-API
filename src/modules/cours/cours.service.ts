import { FastifyInstance } from "fastify";
import { Prisma } from "@prisma/client";

/*
================================
TYPES
================================
*/
export type CreateCoursPayload = {
  nom: string;
  code: string;
  duree: number;
  etape: number;
  specialiteId?: number | null;
  typeDeSalleId?: number | null;
  creerPar?: string | null;
};

export type UpdateCoursPayload = {
  nom?: string;
  code?: string;
  duree?: number;
  etape?: number;
  specialiteId?: number | null;
  typeDeSalleId?: number | null;
  est_harchive?: boolean;
  modifierPar?: string | null;
};

/*
================================
CREATE
================================
*/
export async function createCours(
  app: FastifyInstance,
  data: CreateCoursPayload
) {
  const existingCours = await app.prisma.cours.findFirst({
    where: {
      code: {
        equals: data.code,
        mode: "insensitive",
      },
      supprimeLe: null,
    },
  });

  if (existingCours) {
    throw new Error("Un cours avec ce code existe déjà");
  }

  if (data.specialiteId !== undefined && data.specialiteId !== null) {
    const specialite = await app.prisma.specialite.findFirst({
      where: {
        id: data.specialiteId,
        supprimeLe: null,
      },
    });

    if (!specialite) {
      throw new Error("Spécialité introuvable");
    }
  }

  if (data.typeDeSalleId !== undefined && data.typeDeSalleId !== null) {
    const typeDeSalle = await app.prisma.typeDeSalle.findFirst({
      where: {
        id: data.typeDeSalleId,
        supprimeLe: null,
      },
    });

    if (!typeDeSalle) {
      throw new Error("Type de salle introuvable");
    }
  }

  return app.prisma.cours.create({
    data: {
      nom: data.nom,
      code: data.code,
      duree: data.duree,
      etape: data.etape,
      specialiteId:
        data.specialiteId !== undefined ? data.specialiteId : null,
      typeDeSalleId:
        data.typeDeSalleId !== undefined ? data.typeDeSalleId : null,
      ...(data.creerPar !== undefined ? { creerPar: data.creerPar } : {}),
    },
    include: {
      seances: true,
      cours_programmes: {
        include: { programme: true },
      },
      specialite: true,
      typeDeSalle: true,
    },
  });
}

/*
================================
GET ALL
================================
*/
export async function getAllCours(app: FastifyInstance) {
  return app.prisma.cours.findMany({
    where: {
      supprimeLe: null,
    },
    include: {
      seances: true,
      cours_programmes: {
        include: { programme: true },
      },
      specialite: true,
      typeDeSalle: true,
    },
    orderBy: { id: "desc" },
  });
}

/*
================================
GET BY ID
================================
*/
export async function getCoursById(app: FastifyInstance, id: number) {
  return app.prisma.cours.findFirst({
    where: {
      id,
      supprimeLe: null,
    },
    include: {
      seances: true,
      cours_programmes: {
        include: { programme: true },
      },
      specialite: true,
      typeDeSalle: true,
    },
  });
}

/*
================================
UPDATE
================================
*/
export async function updateCours(
  app: FastifyInstance,
  id: number,
  data: UpdateCoursPayload
) {
  const cours = await app.prisma.cours.findFirst({
    where: {
      id,
      supprimeLe: null,
    },
  });

  if (!cours) {
    throw new Error("Cours introuvable ou déjà supprimé");
  }

  if (data.code !== undefined) {
    const existingCours = await app.prisma.cours.findFirst({
      where: {
        code: {
          equals: data.code,
          mode: "insensitive",
        },
        supprimeLe: null,
        NOT: { id },
      },
    });

    if (existingCours) {
      throw new Error("Un cours avec ce code existe déjà");
    }
  }

  if (data.specialiteId !== undefined && data.specialiteId !== null) {
    const specialite = await app.prisma.specialite.findFirst({
      where: {
        id: data.specialiteId,
        supprimeLe: null,
      },
    });

    if (!specialite) {
      throw new Error("Spécialité introuvable");
    }
  }

  if (data.typeDeSalleId !== undefined && data.typeDeSalleId !== null) {
    const typeDeSalle = await app.prisma.typeDeSalle.findFirst({
      where: {
        id: data.typeDeSalleId,
        supprimeLe: null,
      },
    });

    if (!typeDeSalle) {
      throw new Error("Type de salle introuvable");
    }
  }

  return app.prisma.cours.update({
    where: { id },
    data: {
      ...("nom" in data ? { nom: data.nom } : {}),
      ...("code" in data ? { code: data.code } : {}),
      ...("duree" in data ? { duree: data.duree } : {}),
      ...("etape" in data ? { etape: data.etape } : {}),
      ...("specialiteId" in data ? { specialiteId: data.specialiteId } : {}),
      ...("typeDeSalleId" in data
        ? { typeDeSalleId: data.typeDeSalleId }
        : {}),
      ...("est_harchive" in data ? { est_harchive: data.est_harchive } : {}),
      ...("modifierPar" in data ? { modifierPar: data.modifierPar } : {}),
      modifierLe: new Date(),
    },
    include: {
      seances: true,
      cours_programmes: {
        include: { programme: true },
      },
      specialite: true,
      typeDeSalle: true,
    },
  });
}

/*
================================
SOFT DELETE
================================
*/
export async function softDeleteCours(
  app: FastifyInstance,
  id: number,
  supprimePar?: string | null
) {
  const cours = await app.prisma.cours.findFirst({
    where: {
      id,
      supprimeLe: null,
    },
  });

  if (!cours) {
    throw new Error("Cours introuvable ou déjà supprimé");
  }

  const seanceAffectee = await app.prisma.seance.findFirst({
    where: {
      coursId: id,
      supprimeLe: null,
    },
  });

  if (seanceAffectee) {
    throw new Error(
      "Impossible de supprimer ce cours car il est affecté à une séance"
    );
  }

  return app.prisma.cours.update({
    where: { id },
    data: {
      supprimeLe: new Date(),
      ...(supprimePar !== undefined ? { supprimePar } : {}),
    },
  });
}

/*
================================
PRISMA ERROR
================================
*/
export function isPrismaKnownError(
  error: unknown
): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError;
}