import "dotenv/config";
import bcrypt from "bcrypt";
import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;

export const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: connectionString,
  }),
});

/*
  ---------------------------
  ROOMS PAR DÉFAUT
  ---------------------------
*/

const INITIAL_ROOMS = [
  {
    id: 1,
    code: "A101",
    name: "Salle A101",
    type: "Salle de cours",
    capacity: 40,
    description:
      "Salle standard destinée aux cours magistraux et travaux dirigés.",
  },
  {
    id: 2,
    code: "LAB01",
    name: "Laboratoire Info 1",
    type: "Laboratoire",
    capacity: 24,
    description:
      "Laboratoire équipé d’ordinateurs pour les travaux pratiques et démonstrations techniques.",
  },
  {
    id: 3,
    code: "AMPHI1",
    name: "Amphithéâtre Central",
    type: "Amphithéâtre",
    capacity: 120,
    description:
      "Grand amphithéâtre utilisé pour les cours à grand effectif et les présentations.",
  },
];

async function main() {
  /*
  ===========================
  SEED ROLES
  ===========================
  */

  console.log("Seeding roles...");

  const roles = [
    { nom: "Administrateur", description: "Accès complet au système" },
    {
      nom: "Responsable administratif",
      description: "Gère les utilisateurs et plannings",
    },
  ];

  for (const r of roles) {
    await prisma.role.upsert({
      where: { nom: r.nom },
      update: {},
      create: {
        ...r,
        creerPar: "system",
        creerLe: new Date(),
      },
    });
  }

  /*
  ===========================
  SEED USERS
  ===========================
  */

  console.log("Seeding users...");

  const users = [
    {
      nom: "Kana",
      prenom: "Liliane",
      email: "liliane@gmail.com",
      roleNom: "Administrateur",
    },
    {
      nom: "Njeutsa",
      prenom: "Hermann",
      email: "hermann@gmail.com",
      roleNom: "Responsable administratif",
    },
    {
      nom: "Boyomo",
      prenom: "Albert",
      email: "albert@gmail.com",
      roleNom: "Administrateur",
    },
  ];

  for (const u of users) {
    const role = await prisma.role.findUnique({
      where: { nom: u.roleNom },
    });

    if (!role) throw new Error(`Role ${u.roleNom} introuvable`);

    const hashedPwd = await bcrypt.hash("Default123!", 10);

    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        nom: u.nom,
        prenom: u.prenom,
        email: u.email,
        mot_de_passe: hashedPwd,
        statut: true,
        roleId: role.id,
        creerPar: "system",
        creerLe: new Date(),
      },
    });
  }

  /*
  ===========================
  SEED TYPES DE SALLE
  ===========================
  */

  console.log("Seeding room types...");

  const uniqueRoomTypes = [
    ...new Set(INITIAL_ROOMS.map((room) => room.type)),
  ];

  for (const typeName of uniqueRoomTypes) {
    await prisma.typeDeSalle.upsert({
      where: { nom: typeName },
      update: {},
      create: {
        nom: typeName,
        description: `Type de salle : ${typeName}`,
        creerPar: "system",
        creerLe: new Date(),
      },
    });
  }

  /*
  ===========================
  SEED SALLES
  ===========================
  */
  console.log("Seeding rooms...");

  for (const room of INITIAL_ROOMS) {
    const type = await prisma.typeDeSalle.findUnique({
      where: { nom: room.type },
    });

    if (!type) {
      throw new Error(`Type de salle "${room.type}" introuvable`);
    }

    await prisma.salle.upsert({
      where: { code: room.code },
      update: {
        nom: room.name,
        capacite: room.capacity,
        description: room.description || null,
        typeDeSalleId: type.id,
        modifierPar: "system",
        modifierLe: new Date(),
      },
      create: {
        code: room.code,
        nom: room.name,
        capacite: room.capacity,
        description: room.description || null,
        typeDeSalleId: type.id,
        creerPar: "system",
        creerLe: new Date(),
      },
    });
  }

  console.log("Seed completed successfully !");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });