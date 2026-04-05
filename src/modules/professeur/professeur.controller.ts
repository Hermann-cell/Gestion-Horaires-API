import { FastifyReply, FastifyRequest } from "fastify";
import {
  getProfesseurById,
  updateProfesseur,
  softDeleteProfesseur,
  createProfesseur,
  getAllProfesseurs,
  affecterProfesseurASeance,
  getSeancesSansProfesseur
} from "../professeur/professeur.service.js";

type ProfesseurParams = { id: string };

interface CreateProfesseurBody {
  nom: string;
  prenom: string;
}

interface UpdateProfesseurBody {
  nom?: string;
  prenom?: string;
}

const getAuteur = (req: FastifyRequest): string => {
  const user = req.user as any;
  if (user && user.prenom && user.nom) return `${user.prenom} ${user.nom}`.trim();
  return "Système / Admin";
};

export async function createProfesseurController(request: FastifyRequest<{ Body: CreateProfesseurBody }>, reply: FastifyReply) {
  try {
    const { nom, prenom } = request.body;
    if (!nom || !prenom) return reply.code(400).send({ message: "Nom et prénom requis" });
    const result = await createProfesseur(request.server, { nom, prenom, creerPar: getAuteur(request) });
    return reply.code(201).send(result);
  } catch (err) {
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

export async function assignProfesseur(request: FastifyRequest<{ Params: ProfesseurParams, Body: { seanceId: number } }>, reply: FastifyReply) {
  const id = parseInt(request.params.id);
  if (isNaN(id)) return reply.code(400).send({ message: "ID professeur invalide" });
  try {
    await affecterProfesseurASeance(request.server, id, request.body.seanceId, getAuteur(request));
    return reply.send({ message: "Affectation réussie" });
  } catch (error: any) {
    return reply.code(500).send({ message: "Erreur lors de l'affectation" });
  }
}