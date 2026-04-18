import { FastifyReply, FastifyRequest } from "fastify";
import {
  getProfesseurById,
  updateProfesseur,
  softDeleteProfesseur,
  createProfesseur,
  getAllProfesseurs,
  affecterProfesseurASeance,
  getSeancesSansProfesseur,
  getAllProfesseursWithPlanning
} from "../professeur/professeur.service.js";
import { error } from "console";

type ProfesseurParams = { id: string };

interface CreateProfesseurBody {
  nom: string;
  prenom: string;
  specialiteIds?: number[];
}

interface UpdateProfesseurBody {
  nom?: string;
  prenom?: string;
  specialiteIds?: number[];

}

const getAuteur = (req: FastifyRequest): string => {
  const user = req.user as any;
  if (user && user.prenom && user.nom) return `${user.prenom} ${user.nom}`.trim();
  return "Système / Admin";
};

export async function createProfesseurController(request: FastifyRequest<{ Body: CreateProfesseurBody }>, reply: FastifyReply) {
  try {
    const { nom, prenom, specialiteIds } = request.body;
    if (!nom || !prenom) return reply.code(400).send({ message: "Nom et prénom requis" });
    
    const payload: Partial<CreateProfesseurBody> & { nom: string; prenom: string; creerPar: string } = { 
      nom, 
      prenom,
      creerPar: getAuteur(request) 
    };
    
    if (specialiteIds) {
      payload.specialiteIds = specialiteIds;
    }
    
    const result = await createProfesseur(request.server, payload as CreateProfesseurBody & { creerPar: string });
    return reply.code(201).send(result);
  } catch (err) {
    console.error("Erreur création professeur:", err);
    return reply.code(500).send({ message: "Erreur lors de la création" });
  }
}

export async function getAllProfesseursController(request: FastifyRequest, reply: FastifyReply) {
  const result = await getAllProfesseurs(request.server);
  return reply.send(result);
}

export async function getProfesseur(request: FastifyRequest<{ Params: ProfesseurParams }>, reply: FastifyReply) {
  const id = parseInt(request.params.id);
  if (isNaN(id)) return reply.code(400).send({ message: "ID invalide" });
  const professeur = await getProfesseurById(request.server, id);
  if (!professeur) return reply.code(404).send({ message: "Professeur introuvable" });
  return reply.send(professeur);
}

export async function editProfesseur(request: FastifyRequest<{ Params: ProfesseurParams; Body: UpdateProfesseurBody }>, reply: FastifyReply) {
  const id = parseInt(request.params.id);
  if (isNaN(id)) return reply.code(400).send({ message: "ID invalide" });
  try {
    const payload = { ...request.body, modifierPar: getAuteur(request) };
    const result = await updateProfesseur(request.server, id, payload);
    return reply.send({ message: "Modification réussie", data: result });
  } catch (error: any) {
    return reply.code(500).send({ message: error.message });
  }
}

export async function removeProfesseur(request: FastifyRequest<{ Params: ProfesseurParams }>, reply: FastifyReply) {
  const id = parseInt(request.params.id);
  try {
    await softDeleteProfesseur(request.server, id, getAuteur(request));
    return reply.send({ message: "Professeur supprimé" });
  } catch (error: any) {
    return reply.code(409).send({ message: error.message });
  }
}

export async function getAvailableSeances(request: FastifyRequest, reply: FastifyReply) {
  try {
    const result = await getSeancesSansProfesseur(request.server);
    return reply.send(result);
  } catch (err) {
    return reply.code(500).send({ message: "Erreur de chargement des séances" });
  }
}

interface AssignProfBody {
  seanceId: number;
}

export async function assignProfesseur(
  request: FastifyRequest<{ Params: ProfesseurParams; Body: AssignProfBody }>,
  reply: FastifyReply
) {
  const professeurId = Number(request.params.id);
  const { seanceId } = request.body || {};

  //  Validation
  if (!Number.isInteger(professeurId)) {
    return reply.code(400).send({ message: "ID professeur invalide" });
  }

  if (!Number.isInteger(seanceId)) {
    return reply.code(400).send({ message: "seanceId invalide ou manquant" });
  }

  try {
    const result = await affecterProfesseurASeance(
      request.server,
      professeurId,
      seanceId,
      getAuteur(request)
    );

    return reply.code(200).send({
      message: "Affectation réussie",
      data: result
    });
  } catch (error: any) {
    //  erreurs métier
    if (error?.message) {
      return reply.code(400).send({ message: error.message });
    }

    //  erreurs système
    request.log.error(error);

    return reply.code(500).send({
      message: "Erreur interne du serveur"
    });
  }
}

export async function getAllProfesseursWithPlanningController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const result = await getAllProfesseursWithPlanning(request.server);

    return reply.send({
      message: "Liste des professeurs avec leurs plannings récupérée avec succès",
      data: result,
    });
  } catch (error: any) {
    console.error("Erreur planning professeurs :", error);
    return reply.code(500).send({
      message: "Erreur lors de la récupération des professeurs avec leurs plannings",
      error: error.message,
    });
  }
}