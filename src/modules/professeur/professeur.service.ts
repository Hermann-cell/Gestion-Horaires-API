import { FastifyInstance } from "fastify";
import { Prisma } from "../../../generated/prisma/client.js";

export type UpdateProfesseurPayload = {
  nom?: string;
  prenom?: string;
  modifierPar?: string | null;
};

export type CreateProfesseurPayload = {
  nom: string;
  prenom: string;
};

function formatMatricule(num: number): string {
  return `PROF${String(num).padStart(3, "0")}`;
}

async function generateNextMatricule(app: FastifyInstance): Promise<string> {
  const professeurs = await app.prisma.professeur.findMany({
    select: { matricule: true },
  });

  let maxNum = 0;

  for (const prof of professeurs) {
    const match = /^PROF(\d+)$/i.exec(prof.matricule ?? "");
    if (match) {
      const num = Number(match[1]);
      if (!Number.isNaN(num) && num > maxNum) {
        maxNum = num;
      }
    }
  }

  return formatMatricule(maxNum + 1);
}

/*
================================
API SERVICE : GET PROFESSEUR
================================
*/
export async function getProfesseurById(app: FastifyInstance, id: number) {
  return app.prisma.professeur.findFirst({
    where: {
      id,
      supprimeLe: null,
    },
    include: {
      seances: true,
      specialite_professeurs: {
        include: {
          specialite: true,
        },
      },
      disponibilite_professeurs: {
        include: {
          disponibilite: true,
        },
      },
    },
  });
}

/*
================================
API SERVICE : GET PROFESSEUR SIMPLE
================================
*/
export type GetProfesseurPayload = {
  nom: string;
  prenom: string;
  matricule: string;
};

export async function getProfesseurByMatricule(
  app: FastifyInstance,
  matricule: string
) {
  return app.prisma.professeur.findFirst({
    where: {
      matricule: {
        equals: matricule,
        mode: "insensitive",
      },
      supprimeLe: null,
    },
  });
}

/*
================================
API SERVICE : CREATE PROFESSEUR
================================
*/
export async function createProfesseur(
  app: FastifyInstance,
  data: CreateProfesseurPayload
) {
  const matricule = await generateNextMatricule(app);

  return app.prisma.professeur.create({
    data: {
      nom: data.nom,
      prenom: data.prenom,
      matricule,
    },
  });
}

/*API SERVICE : GET ALL PROFESSEURS
*/
export async function getAllProfesseurs(app: FastifyInstance) {
  return app.prisma.professeur.findMany({
    where: {
      supprimeLe: null,
    },
    orderBy: {
      id: "asc",
    },
  });
}

/*
================================
API SERVICE : UPDATE PROFESSEUR
================================
*/
export async function updateProfesseur(
  app: FastifyInstance,
  id: number,
  data: UpdateProfesseurPayload
) {
  const professeur = await app.prisma.professeur.findFirst({
    where: {
      id,
      supprimeLe: null,
    },
  });

  if (!professeur) {
    throw new Error("Professeur introuvable ou déjà supprimé");
  }

  return app.prisma.professeur.update({
    where: { id },
    data: {
      ...(data.nom !== undefined && { nom: data.nom }),
      ...(data.prenom !== undefined && { prenom: data.prenom }),
      ...(data.modifierPar !== undefined && { modifierPar: data.modifierPar }),
      modifierLe: new Date(),
    },
  });
}
/*
================================
API SERVICE : DELETE PROFESSEUR
================================
*/
export async function softDeleteProfesseur(
  app: FastifyInstance,
  id: number,
  supprimePar?: string | null
) {
  const professeur = await app.prisma.professeur.findFirst({
    where: {
      id,
      supprimeLe: null,
    },
  });

  if (!professeur) {
    throw new Error("Professeur introuvable ou déjà supprimé");
  }

  const seanceAffectee = await app.prisma.seance.findFirst({
    where: {
      professeurId: id,
      supprimeLe: null,
    },
  });

  if (seanceAffectee) {
    throw new Error(
      "Impossible de supprimer ce professeur car il est affecté à une séance"
    );
  }

  return app.prisma.professeur.update({
    where: { id },
    data: {
      supprimeLe: new Date(),
      ...(supprimePar !== undefined ? { supprimePar } : {}),
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