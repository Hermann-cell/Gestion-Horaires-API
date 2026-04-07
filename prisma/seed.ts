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
      "Grand amphithéâtre pour cours à grand effectif.",
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

    if (!type) throw new Error(`Type ${room.type} introuvable`);

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
  SEED SPECIALITES
  ===========================
  */
  console.log("Seeding specialites...");

  const specialite = await prisma.specialite.upsert({
    where: { nom: "Informatique" },
    update: {},
    create: {
      nom: "Informatique",
      creerPar: "system",
      creerLe: new Date(),
    },
  });

  /*
  ===========================
  SEED PROFESSEURS
  ===========================
  */
  console.log("Seeding professeurs...");

  const profsData = [
    { matricule: "PROF001", nom: "Dupont", prenom: "Jean" },
    { matricule: "PROF002", nom: "Nguyen", prenom: "Anna" },
    { matricule: "PROF003", nom: "Smith", prenom: "John" },
    { matricule: "PROF004", nom: "Mbappe", prenom: "Eric" },
  ];

  const profs = [];

  for (const p of profsData) {
    const prof = await prisma.professeur.upsert({
      where: { matricule: p.matricule },
      update: {},
      create: {
        ...p,
        creerPar: "system",
        creerLe: new Date(),
      },
    });

    profs.push(prof);
  }
  /*
  ===========================
  SEED COURS
  ===========================
  */
  console.log("Seeding cours...");

  const coursDataList = [
    { code: "INFO101", nom: "Algorithmique", duree: 60, etape: 1 },
    { code: "INFO102", nom: "Structures de données", duree: 60, etape: 1 },
    { code: "INFO201", nom: "Bases de données", duree: 90, etape: 2 },
    { code: "INFO202", nom: "Programmation Web", duree: 90, etape: 2 },
  ];

  const coursList = [];

  for (const c of coursDataList) {
    const cours = await prisma.cours.upsert({
      where: { code: c.code },
      update: {},
      create: {
        ...c,
        specialiteId: specialite.id,
        creerPar: "system",
        creerLe: new Date(),
      },
    });

    coursList.push(cours);
  }

  /*
  ===========================
  SEED DISPONIBILITES + PLAGES
  ===========================
  */
  console.log("Seeding disponibilites...");

  const jours = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"];

  for (const j of jours) {
    let dispo = await prisma.disponibilite.findFirst({
      where: { jour: j },
    });

    if (!dispo) {
      dispo = await prisma.disponibilite.create({
        data: {
          jour: j,
          creerPar: "system",
          creerLe: new Date(),
        },
      });
    }

    const slots = [8, 14];

    for (const start of slots) {
      const hD = new Date();
      hD.setHours(start, 0, 0, 0);

      const hF = new Date();
      hF.setHours(start + 2, 0, 0, 0);

      const plage = await prisma.plageHoraire.upsert({
        where: {
          heure_debut_heure_fin: {
            heure_debut: hD,
            heure_fin: hF,
          },
        },
        update: {},
        create: {
          heure_debut: hD,
          heure_fin: hF,
          statut: true,
          creerPar: "system",
          creerLe: new Date(),
        },
      });

      await prisma.plageHoraire_Disponibilite.upsert({
        where: {
          plageHoraireId_disponibiliteId: {
            plageHoraireId: plage.id,
            disponibiliteId: dispo.id,
          },
        },
        update: {},
        create: {
          plageHoraireId: plage.id,
          disponibiliteId: dispo.id,
          creerPar: "system",
          creerLe: new Date(),
        },
      });
    }
  }

  /*
  ===========================
  SEED SEANCES (MULTIPLES)
  ===========================
  */
  console.log("Seeding seances...");

  const allPlages = await prisma.plageHoraire.findMany();
  const allSalles = await prisma.salle.findMany();

  if (!allPlages.length || !allSalles.length) {
    throw new Error("Données insuffisantes pour créer les séances");
  }

  for (let i = 0; i < profs.length; i++) {
    const prof = profs[i];
    const cours = coursList[i % coursList.length];

    if (!prof || !cours) continue;

    for (let j = 0; j < 3; j++) {
      const pl = allPlages[(i + j) % allPlages.length];
      const s = allSalles[(i + j) % allSalles.length];

      if (!pl || !s) continue;

      const date = new Date();
      date.setDate(date.getDate() + j);

      const exists = await prisma.seance.findFirst({
        where: {
          coursId: cours.id,
          professeurId: prof.id,
          plageHoraireId: pl.id,
          date: date,
        },
      });

      if (!exists) {
        await prisma.seance.create({
          data: {
            date,
            coursId: cours.id,
            salleId: s.id,
            plageHoraireId: pl.id,
            professeurId: prof.id,
            creerPar: "system",
            creerLe: new Date(),
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