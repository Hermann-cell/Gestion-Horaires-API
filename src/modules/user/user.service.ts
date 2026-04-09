import { FastifyInstance } from "fastify";
import bcrypt from "bcrypt";
import { CreateUserDto } from "./dto/create-user.dto.js";
import { UpdateUserDto } from "./dto/update-user.dto.js";
import jwt from "jsonwebtoken";
import { EmailService } from "../email/email.service.js";
import { resetPasswordTemplate } from "../email/templates/reset-password.template.js";

const RESET_SECRET  = process.env.ACTIVATION_SECRET || "activation_secret";

// Récupérer tous les users avec leur rôle
export async function getAllUsers(fastify: FastifyInstance) {
  return fastify.prisma.user.findMany({
  where: { supprimeLe: null },
  orderBy: { id: "asc" },
  include: { role: true },
});
}

// Récupérer un user par id avec son rôle
export async function getUserById(
  fastify: FastifyInstance,
  id: number
) {
  return fastify.prisma.user.findFirst({
  where: { id, supprimeLe: null },
  include: { role: true },
});
}

// Créer un user
export async function createUser(
  fastify: FastifyInstance,
  data: CreateUserDto
) {
  const hashedPassword = await bcrypt.hash(data.mot_de_passe, 10);

  return fastify.prisma.user.create({
    data: {
      nom: data.nom,
      prenom: data.prenom,
      email: data.email,
      mot_de_passe: hashedPassword,
      roleId: data.roleId,
    },
    include: { role: true },
  });
}

// Login
export async function loginUser(
  fastify: FastifyInstance,
  email: string,
  mot_de_passe: string
) {

  const user = await fastify.prisma.user.findUnique({
    where: { email },
    include: { role: true },
  });

  if (!user) {
    throw new Error("Utilisateur non trouvé");
  }

  const valid = await bcrypt.compare(mot_de_passe, user.mot_de_passe);

  if (!valid) {
    throw new Error("Mot de passe incorrect");
  }

  const token = fastify.jwt.sign({
    id: user.id,
    email: user.email,
    role: user.role.nom,
  });

  return {
    token,
    user: {
      id: user.id,
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      role: user.role.nom
    }
  };
}

// Mettre à jour un user
export async function updateUser(
  fastify: FastifyInstance,
  id: number,
  data: UpdateUserDto
) {
  const updateData: any = { ...data };

  // Si le mot de passe est fourni, le hasher
  if (data.mot_de_passe) {
    updateData.mot_de_passe = await bcrypt.hash(data.mot_de_passe, 10);
  }

  return fastify.prisma.user.update({
    where: { id },
    data: updateData,
    include: { role: true },
  });
}

// Supprimer un user
export async function deleteUser(
  fastify: FastifyInstance,
  id: number,
  supprimePar?: string | null
) {
  // Récupérer le user pour avoir son email
  const user = await fastify.prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return fastify.prisma.user.update({
    where: { id },
    data: {
      supprimeLe: new Date(),
      ...(supprimePar !== undefined ? { supprimePar } : {}),

      // 👇 libère l'unicité de l'email
      email: `${user.email}__deleted__${Date.now()}`,
    },
    include: { role: true },
  });
}

// Oublie de mot de passe
export async function forgotPassword(
  fastify: FastifyInstance,
  email: string
) {

  const user = await fastify.prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    return;
  }

  const token = jwt.sign(
    { userId: user.id },
    RESET_SECRET,
    { expiresIn: "1h" }
  );

  const link = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  const html = resetPasswordTemplate(link);

  const emailService = new EmailService(fastify);

  await emailService.sendEmail({
    to: user.email,
    subject: "Réinitialisation du mot de passe",
    html
  });
}

// Réinitialisation du mot de passe
export async function resetPassword(
  fastify: FastifyInstance,
  token: string,
  password: string
) {
  // Vérification du token
  const payload: any = jwt.verify(token, RESET_SECRET);

  // Hash du mot de passe
  const hashed = await bcrypt.hash(password, 10);

  // Update user + activation automatique
  await fastify.prisma.user.update({
    where: { id: payload.userId },
    data: {
      mot_de_passe: hashed,
      statut: true, //  activation automatique
    },
  });

  return { message: "Password updated successfully" };
}