import { FastifyRequest, FastifyReply } from "fastify";
import * as service from "./user.service.js";
import { plainToInstance } from "class-transformer";
import { validateOrReject } from "class-validator";
import { CreateUserDto } from "./dto/create-user.dto.js";
import { UpdateUserDto } from "./dto/update-user.dto.js";

import { generateActivationToken } from "../auth/token.service.js";
import { activationEmailTemplate } from "../email/templates/activation.template.js";
import { EmailService } from "../email/email.service.js";

// -------------------- Contrôleurs -------------------- //

// Récupérer tous les utilisateurs
export async function getUsers(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const users = await service.getAllUsers(request.server);
    return reply.send(users);
  } catch (e) {
    request.log.error(e);
    return reply.code(500).send({ message: "Internal server error" });
  }
}

// Récupérer un utilisateur par ID
export async function getUser(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const id = Number(request.params.id);

  try {
    const user = await service.getUserById(request.server, id);
    if (!user) {
      return reply.code(404).send({ message: "User not found" });
    }
    return reply.send(user);
  } catch (e) {
    request.log.error(e);
    return reply.code(500).send({ message: "Internal server error" });
  }
}

// Créer un utilisateur avec DTO + validation + envoi email activation
export async function createUser(
  request: FastifyRequest<{ Body: CreateUserDto }>,
  reply: FastifyReply
) {
  try {
    const dto = plainToInstance(CreateUserDto, request.body);
    await validateOrReject(dto);

    const user = await service.createUser(request.server, dto);

    // -----------------------------
    // Générer token activation
    // -----------------------------
    const token = generateActivationToken(user.id);

    const activationLink = `${process.env.FRONTEND_URL}/activate-account?token=${token}`;

    // -----------------------------
    // Construire email
    // -----------------------------
    const html = activationEmailTemplate(
      user.nom || "Utilisateur",
      activationLink
    );

    const emailService = new EmailService(request.server);

    await emailService.sendEmail({
      to: user.email,
      subject: "Activation de votre compte",
      html
    });

    return reply.code(201).send({
      message: "User created. Activation email sent.",
      user
    });

  } catch (errors) {
    request.log.error(errors);
    return reply.code(400).send({ errors });
  }
}

// Login (authentification)
export async function loginController(
  request: FastifyRequest<{ Body: { email: string; mot_de_passe: string } }>,
  reply: FastifyReply
) {
  const { email, mot_de_passe } = request.body;
  try {
    const result = await service.loginUser(request.server, email, mot_de_passe);
    return reply.send(result);
  } catch (err: any) {
    request.log.error(err);
    return reply.code(401).send({ error: err.message });
  }
}

// Mettre à jour un utilisateur avec DTO + validation
export async function updateUser(
  request: FastifyRequest<{
    Params: { id: string };
    Body: UpdateUserDto;
  }>,
  reply: FastifyReply
) {
  const id = Number(request.params.id);

  try {
    const dto = plainToInstance(UpdateUserDto, request.body);
    await validateOrReject(dto);

    const user = await service.updateUser(request.server, id, dto);
    return reply.send(user);
  } catch (errors) {
    request.log.error(errors);
    return reply.code(400).send({ errors });
  }
}

// Supprimer un utilisateur
export async function deleteUser(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const id = Number(request.params.id);

  try {
    await service.deleteUser(request.server, id);
    return reply.code(204).send();
  } catch (e: any) {
    request.log.error(e);
    return reply.code(400).send({ message: e.message });
  }
}