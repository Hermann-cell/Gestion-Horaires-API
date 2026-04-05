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
      "Laboratoire équipé d’ordinateurs pour les travaux pratiques.",
  },
  {
    id: 3,
    code: "AMPHI1",
    name: "Amphithéâtre Central",
    type: "Amphithéâtre",
    capacity: 120,
    description:
      "Grand amphithéâtre utilisé pour les cours à grand effectif.",
  },
];

async function main() {
  /*
  ===========================
  ROLES (inchangé)
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
  USERS (inchangé)
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
  TYPES DE SALLE (inchangé)
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
  SALLES (inchangé)
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

  /*
  ===========================
  SPECIALITES (NOUVEAU)
  ===========================
  */
  console.log("Seeding specialites...");

  const specialites = ["Informatique", "Mathématiques", "Physique"];

  for (const nom of specialites) {
    const exists = await prisma.specialite.findFirst({ where: { nom } });

    if (!exists) {
      await prisma.specialite.create({
        data: {
          nom,
          creerPar: "system",
          creerLe: new Date(),
        },
      });
    }
  }

  /*
  ===========================
  PROFESSEURS (NOUVEAU)
  ===========================
  */
  console.log("Seeding professeurs...");

  const profs = [
    { nom: "Dupont", prenom: "Jean", matricule: "PROF001" },
    { nom: "Nguyen", prenom: "Linh", matricule: "PROF002" },
    { nom: "Smith", prenom: "John", matricule: "PROF003" },
  ];

  for (const p of profs) {
    await prisma.professeur.upsert({
      where: { matricule: p.matricule },
      update: {},
      create: {
        ...p,
        creerPar: "system",
        creerLe: new Date(),
      },
    });
  }

  /*
  ===========================
  COURS (NOUVEAU - CORRIGÉ)
  ===========================
  */
  console.log("Seeding cours...");

  const info = await prisma.specialite.findFirst({
    where: { nom: "Informatique" },
  });

  const math = await prisma.specialite.findFirst({
    where: { nom: "Mathématiques" },
  });

  const cours = [
    {
      nom: "Algorithmique",
      code: "INFO101",
      duree: 60,
      etape: 1,
      specialiteId: info?.id,
    },
    {
      nom: "Structures de données",
      code: "INFO201",
      duree: 75,
      etape: 2,
      specialiteId: info?.id,
    },
    {
      nom: "Algèbre",
      code: "MATH101",
      duree: 60,
      etape: 1,
      specialiteId: math?.id,
    },
  ];

  for (const c of cours) {
    await prisma.cours.upsert({
      where: { code: c.code },
      update: {},
      create: {
        nom: c.nom,
        code: c.code,
        duree: c.duree,
        etape: c.etape,
        creerPar: "system",
        creerLe: new Date(),
        ...(c.specialiteId !== undefined && {
          specialiteId: c.specialiteId,
        }),
      },
    });
  }

  /*
  ===========================
  RELATION PROF <-> SPECIALITE (NOUVEAU)
  ===========================
  */
  console.log("Seeding specialite_professeurs...");

  const profList = await prisma.professeur.findMany();
  const specList = await prisma.specialite.findMany();

  for (const prof of profList) {
    for (const spec of specList) {
      const exists = await prisma.specialite_Professeur.findFirst({
        where: {
          professeurId: prof.id,
          specialiteId: spec.id,
        },
      });

      if (!exists && Math.random() > 0.5) {
        await prisma.specialite_Professeur.create({
          data: {
            professeurId: prof.id,
            specialiteId: spec.id,
          },
        });
      }
    }
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