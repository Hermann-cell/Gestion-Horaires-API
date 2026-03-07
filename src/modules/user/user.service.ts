import { FastifyInstance } from "fastify";
import bcrypt from "bcrypt";
import { CreateUserDto } from "./dto/create-user.dto.js";
import { UpdateUserDto } from "./dto/update-user.dto.js";

// Récupérer tous les users avec leur rôle
export async function getAllUsers(fastify: FastifyInstance) {
  return fastify.prisma.user.findMany({
    orderBy: { id: "asc" },
    include: { role: true },
  });
}

// Récupérer un user par id avec son rôle
export async function getUserById(
  fastify: FastifyInstance,
  id: number
) {
  return fastify.prisma.user.findUnique({
    where: { id },
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

  // Générer le JWT
  const token = fastify.jwt.sign({
    id: user.id,
    email: user.email,
    role: user.role.nom,
  });

  return { token, user };
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
    delete updateData.mot_de_passe;
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
  id: number
) {
  return fastify.prisma.user.delete({
    where: { id },
    include: { role: true },
  });
}