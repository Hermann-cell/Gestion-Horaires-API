import { FastifyReply, FastifyRequest } from "fastify";
import {
  getProfesseurById,
  updateProfesseur,
  softDeleteProfesseur,
  createProfesseur,
  getAllProfesseurs,
  UpdateProfesseurPayload,
  CreateProfesseurPayload
} from "../professeur/professeur.service.js";

type ProfesseurParams = { id: string };

// Interface pour typer l'utilisateur extrait du token JWT
interface AuthUser {
  prenom: string;
  nom: string;
  email?: string;
}

/*
================================
API : CREATE PROFESSEUR
================================
*/
export async function createProfesseurController(
  request: FastifyRequest<{ Body: Omit<CreateProfesseurPayload, 'creerPar'> }>, 
  reply: FastifyReply
) {
  try {
    const { nom, prenom } = request.body;
    if (!nom || !prenom) {
      return reply.code(400).send({ message: "Nom et prénom requis" });
    }

    // Extraction de l'auteur depuis le token JWT
    const user = request.user as AuthUser;
    const auteur = `${user.prenom} ${user.nom}`.trim();

    const result = await createProfesseur(request.server, { 
      nom, 
      prenom, 
      creerPar: auteur 
    });

    return reply.code(201).send(result);
  } catch (err) {
    request.log.error(err);
    return reply.code(500).send({ message: "Erreur lors de la création" });
  }
}

/*
================================
API : GET ALL PROFESSEURS
================================
*/
export async function getAllProfesseursController(request: FastifyRequest, reply: FastifyReply) {
  try {
    const result = await getAllProfesseurs(request.server);
    return reply.send(result);
  } catch (err) {
    return reply.code(500).send({ message: "Erreur de récupération" });
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
  const id = parseInt(request.params.id);
  if (isNaN(id)) return reply.code(400).send({ message: "ID invalide" });

  try {
    const professeur = await getProfesseurById(request.server, id);
    if (!professeur) return reply.code(404).send({ message: "Professeur introuvable" });
    return reply.send(professeur);
  } catch (err) {
    return reply.code(500).send({ message: "Erreur serveur" });
  }
}

/*
================================
API : UPDATE PROFESSEUR (INFO + DISPOS)
================================
*/
export async function editProfesseur(
  request: FastifyRequest<{ Params: ProfesseurParams, Body: UpdateProfesseurPayload }>, 
  reply: FastifyReply
) {
  const id = parseInt(request.params.id);
  if (isNaN(id)) return reply.code(400).send({ message: "ID invalide" });

  try {
    // Extraction de l'auteur depuis le token JWT
    const user = request.user as AuthUser;
    const auteur = `${user.prenom} ${user.nom}`.trim();

    // On injecte l'auteur dans le payload pour le service
    const payload = {
      ...request.body,
      modifierPar: auteur
    };

    const result = await updateProfesseur(request.server, id, payload);
    return reply.send({ message: "Professeur modifié avec succès", data: result });
  } catch (error: any) {
    request.log.error(error);
    return reply.code(500).send({ message: error.message || "Erreur lors de la modification" });
  }
}

/*
================================
API : DELETE PROFESSEUR
================================
*/
export async function removeProfesseur(
  request: FastifyRequest<{ Params: ProfesseurParams }>, 
  reply: FastifyReply
) {
  const id = parseInt(request.params.id);
  if (isNaN(id)) return reply.code(400).send({ message: "ID invalide" });

  try {
    // Extraction de l'auteur depuis le token JWT
    const user = request.user as AuthUser;
    const auteur = `${user.prenom} ${user.nom}`.trim();

    await softDeleteProfesseur(request.server, id, auteur);
    
    return reply.send({ message: "Professeur supprimé avec succès" });
  } catch (error: any) {
    request.log.error(error);
    // Gestion spécifique si le prof est lié à une séance (Erreur 409 Conflict)
    if (error.message.includes("affecté")) {
      return reply.code(409).send({ message: error.message });
    }
    return reply.code(500).send({ message: "Erreur lors de la suppression" });
  }
}