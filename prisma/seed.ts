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

  const specialitesData = [
    { nom: "Informatique" },
    { nom: "Mathématiques" },
    { nom: "Physique" },
    { nom: "Chimie" },
    { nom: "Biologie" },
    { nom: "Génie Civil" },
  ];

  const specialites = [];

  for (const spec of specialitesData) {
    const specialite = await prisma.specialite.upsert({
      where: { nom: spec.nom },
      update: {},
      create: {
        nom: spec.nom,
        creerPar: "system",
        creerLe: new Date(),
      },
    });
    specialites.push(specialite);
  }

  const specialite = specialites[0]; // Pour la compatibilité avec le reste du seed

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
  SEED AFFECTATION PROFESSEURS - SPECIALITES
  ===========================
  */
  console.log("Seeding professeur-specialite affectations...");

  for (let i = 0; i < profs.length; i++) {
    const prof = profs[i];
    const spec = specialites[i % specialites.length]; // Distribuer les spécialités aux professeurs

    if (!prof || !spec) continue;

    await prisma.specialite_Professeur.upsert({
      where: {
        professeurId_specialiteId: {
          professeurId: prof.id,
          specialiteId: spec.id,
        },
      },
      update: {},
      create: {
        professeurId: prof.id,
        specialiteId: spec.id,
        creerPar: "system",
        creerLe: new Date(),
      },
    });
  }
  /*
  ===========================
  SEED PLAGES HORAIRES
  ===========================
  */
  console.log("Seeding plages horaires...");

  let plages = await prisma.plageHoraire.findMany();

  if (!plages.length) {
    console.log("Création de plages horaires globales...");
    const plageTemplates = [
      { debut: "08:00", fin: "09:30" },
      { debut: "09:45", fin: "11:15" },
      { debut: "11:30", fin: "13:00" },
      { debut: "14:00", fin: "15:30" },
    ];

    for (const p of plageTemplates) {
      const partsD = p.debut.split(":");
      const hD = Number(partsD[0]) || 0;
      const mD = Number(partsD[1]) || 0;
      const partsF = p.fin.split(":");
      const hF = Number(partsF[0]) || 0;
      const mF = Number(partsF[1]) || 0;

      const heureDebut = new Date();
      heureDebut.setHours(hD, mD, 0, 0);

      const heureFin = new Date();
      heureFin.setHours(hF, mF, 0, 0);

      await prisma.plageHoraire.upsert({
        where: { heure_debut_heure_fin: { heure_debut: heureDebut, heure_fin: heureFin } },
        update: {},
        create: { heure_debut: heureDebut, heure_fin: heureFin, creerPar: "system" },
      });
    }

    // rechargement pour utiliser dans les disponibilités
    plages = await prisma.plageHoraire.findMany();
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

  for (let i = 0; i < coursDataList.length; i++) {
    const c = coursDataList[i];
    const specialite = specialites[i % specialites.length]; // Distribuer les cours sur les spécialités distinctes

    if (!specialite || !c) continue;

    const cours = await prisma.cours.upsert({
      where: { code: c.code },
      update: {},
      create: {
        ...c,
        specialiteId: specialite?.id || null,
        creerPar: "system",
        creerLe: new Date(),
      },
    });

    coursList.push(cours);
  }

  /*
  ===========================
  SEED DISPONIBILITES PAR PROF
  ===========================
  */
  console.log("Seeding disponibilites par prof...");

  for (const prof of profs) {
    const jours = ["Lundi", "Mardi"];
    for (let i = 0; i < jours.length; i++) {
      const jour = jours[i]!;

      // Création d'une dispo par professeur et par jour
      const dispo = await prisma.disponibilite.upsert({
        where: { professeurId_jour: { professeurId: prof.id, jour } },
        update: {},
        create: { professeurId: prof.id, jour, creerPar: "system" },
      });

      // Lien dispo ↔ plages horaires
      for (const pl of plages) {
        await prisma.plageHoraire_Disponibilite.upsert({
          where: { plageHoraireId_disponibiliteId: { plageHoraireId: pl.id, disponibiliteId: dispo.id } },
          update: {},
          create: { plageHoraireId: pl.id, disponibiliteId: dispo.id, creerPar: "system" },
        });
      }
    }
  }
  /*
  ===========================
  SEED SEANCES AVEC PROF
  ===========================
  */
  console.log("Seeding seances avec prof...");

  const allSalles = await prisma.salle.findMany();

  if (!allSalles.length) {
    throw new Error("Pas de salles");
  }

  for (let i = 0; i < profs.length; i++) {
    const prof = profs[i];
    if (!prof) continue;
    const cours = coursList[i % coursList.length];
    if (!cours) continue;

    const dispoProf = await prisma.disponibilite.findMany({
      where: { professeurId: prof.id },
      include: { plageHoraire_Disponibilites: { include: { plageHoraire: true } } },
    });

    let plagesProf = dispoProf.flatMap(d => d.plageHoraire_Disponibilites.map(p => p.plageHoraire));
    if (!plagesProf.length) plagesProf = plages;

    for (let j = 0; j < 3; j++) {
      const pl = plagesProf[j % plagesProf.length];
      const salle = allSalles[j % allSalles.length];
      if (!pl || !salle) continue;

      const date = new Date();
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() + j + i * 3);

      const exists = await prisma.seance.findFirst({
        where: { coursId: cours.id, professeurId: prof.id, plageHoraireId: pl.id, date },
      });

      if (!exists) {
        await prisma.seance.create({
          data: { date, coursId: cours.id, salleId: salle.id, plageHoraireId: pl.id, professeurId: prof.id, creerPar: "system" },
        });
        console.log(`Création séance prof ${prof.id} → ${date.toDateString()}`);
      }
    }
  }

  /*
  ===========================
  SEED SEANCES SANS PROF
  ===========================
  */
  console.log("Seeding seances sans prof...");

  for (let i = 0; i < 5; i++) {
    const cours = coursList[i % coursList.length];
    const salle = allSalles[i % allSalles.length];
    const pl = plages[i % plages.length];
    if (!cours || !salle || !pl) continue;

    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + i + 100);

    const exists = await prisma.seance.findFirst({
      where: { coursId: cours.id, professeurId: null, plageHoraireId: pl.id, date },
    });

    if (!exists) {
      await prisma.seance.create({
        data: { date, coursId: cours.id, salleId: salle.id, plageHoraireId: pl.id, professeurId: null, creerPar: "system" },
      });
      console.log(`Création séance sans prof → ${date.toDateString()}`);
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