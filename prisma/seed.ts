import "dotenv/config";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
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
  /*
  ===========================
  SEED PLAGES HORAIRES (FIX)
  ===========================
  */
  console.log("Seeding plages horaires...");

  //  Reset propre (recommandé en seed)
  await prisma.seance.deleteMany();
  await prisma.plageHoraire_Disponibilite.deleteMany();
  await prisma.plageHoraire.deleteMany();

  const plages = [];

  for (let heure = 8; heure < 22; heure++) {
    if (heure >= heure + 1) {
      throw new Error("Plage horaire invalide");
    }

    const pl = await prisma.plageHoraire.create({
      data: {
        heure_debut: heure,
        heure_fin: heure + 1,
        creerPar: "system",
        creerLe: new Date(),
      },
    });

    plages.push(pl);
  }

  console.log(` ${plages.length} plages horaires créées`);


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
  // console.log("Seeding disponibilites par prof...");

  // for (const prof of profs) {
  //   const jours = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"];
  //   for (let i = 0; i < jours.length; i++) {
  //     const jour = jours[i]!;

  //     // Création d'une dispo par professeur et par jour
  //     const dispo = await prisma.disponibilite.upsert({
  //       where: { professeurId_jour: { professeurId: prof.id, jour } },
  //       update: {},
  //       create: { professeurId: prof.id, jour, creerPar: "system" },
  //     });

  //     // Lien dispo ↔ plages horaires
  //     for (const pl of plages) {
  //       await prisma.plageHoraire_Disponibilite.upsert({
  //         where: { plageHoraireId_disponibiliteId: { plageHoraireId: pl.id, disponibiliteId: dispo.id } },
  //         update: {},
  //         create: { plageHoraireId: pl.id, disponibiliteId: dispo.id, creerPar: "system" },
  //       });
  //     }
  //   }
  // }
  // /*
  // ===========================
  // SEED SEANCES AVEC PROF
  // ===========================
  // */
  // console.log("Seeding seances avec prof...");

  // function getNextDateForDay(targetDay: string): Date {
  //   const daysMap: Record<string, number> = {
  //     Dimanche: 0,
  //     Lundi: 1,
  //     Mardi: 2,
  //     Mercredi: 3,
  //     Jeudi: 4,
  //     Vendredi: 5,
  //     Samedi: 6,
  //   };

  //   const today = new Date();
  //   const target = daysMap[targetDay];

  //   if (target === undefined) {
  //     throw new Error(`Jour invalide: ${targetDay}`);
  //   }

  //   const result = new Date(today);
  //   const diff = (target - result.getDay() + 7) % 7;

  //   result.setDate(result.getDate() + diff);
  //   result.setHours(0, 0, 0, 0);

  //   return result;
  // }

  // /*
  // ===========================
  // SEED SEANCES AVEC PROF (FIX)
  // ===========================
  // */
  // console.log("Seeding seances avec prof...");

  // const allSalles = await prisma.salle.findMany();

  // if (!allSalles.length) {
  //   throw new Error("Aucune salle disponible");
  // }

  // for (let i = 0; i < profs.length; i++) {
  //   const prof = profs[i];
  //   if (!prof) continue;

  //   const cours = coursList[i % coursList.length];
  //   if (!cours) continue;

  //   const dispoProf = await prisma.disponibilite.findMany({
  //     where: { professeurId: prof.id },
  //     include: {
  //       plageHoraire_Disponibilites: {
  //         include: { plageHoraire: true },
  //       },
  //     },
  //   });

  //   if (!dispoProf.length) continue;

  //   for (let j = 0; j < 3; j++) {
  //     const dispo = dispoProf[j % dispoProf.length];
  //     if (!dispo) continue;

  //     // ✅ Plages liées à CE jour uniquement
  //     const plagesDispo = dispo.plageHoraire_Disponibilites.map(
  //       (p) => p.plageHoraire
  //     );

  //     if (!plagesDispo.length) continue;

  //     const pl = plagesDispo[j % plagesDispo.length];
  //     const salle = allSalles[j % allSalles.length];

  //     if (!pl || !salle) continue;

  //     // ✅ Date cohérente + décalage pour éviter conflits
  //     const baseDate = getNextDateForDay(dispo.jour);
  //     const date = new Date(baseDate);
  //     date.setDate(baseDate.getDate() + j); // 🔥 évite collision

  //     // 🔒 Vérifier conflit PROF
  //     const profConflict = await prisma.seance.findFirst({
  //       where: {
  //         professeurId: prof.id,
  //         date,
  //         plageHoraireId: pl.id,
  //       },
  //     });

  //     // 🔒 Vérifier conflit SALLE
  //     const salleConflict = await prisma.seance.findFirst({
  //       where: {
  //         salleId: salle.id,
  //         date,
  //         plageHoraireId: pl.id,
  //       },
  //     });

  //     if (profConflict || salleConflict) continue;

  //     await prisma.seance.create({
  //       data: {
  //         date,
  //         coursId: cours.id,
  //         salleId: salle.id,
  //         plageHoraireId: pl.id,
  //         professeurId: prof.id,
  //         creerPar: "system",
  //         creerLe: new Date(),
  //       },
  //     });

  //     console.log(
  //       ` Séance créée: Prof ${prof.id} | ${dispo.jour}   | ${pl.heure_debut}h-${pl.heure_fin}h | Salle ${salle.code}`
  //     );
  //   }
  // }

  // /*
  // ===========================
  // SEED SEANCES SANS PROF
  // ===========================
  // */
  // console.log("Seeding seances sans prof...");


  // for (let i = 0; i < 5; i++) {
  //   const cours = coursList[i % coursList.length];
  //   const salle = allSalles[i % allSalles.length];
  //   const pl = plages[i % plages.length];

  //   if (!cours || !salle || !pl) continue;

  //   const date = new Date();
  //   date.setHours(0, 0, 0, 0);
  //   date.setDate(date.getDate() + i + 100);

  //   const conflict = await prisma.seance.findFirst({
  //     where: {
  //       date,
  //       plageHoraireId: pl.id,
  //       salleId: salle.id,
  //     },
  //   });

  //   if (conflict) continue;

  //   await prisma.seance.create({
  //     data: {
  //       date,
  //       coursId: cours.id,
  //       salleId: salle.id,
  //       plageHoraireId: pl.id,
  //       professeurId: null,
  //       creerPar: "system",
  //       creerLe: new Date(),
  //     },
  //   });

  //   console.log(` Séance sans prof créée → ${date.toDateString()}`);
  // }

  /*
===========================
SEED PROGRAMME
===========================
*/
  console.log("Seeding programmes...");

const programmes = [
  {
    nom: "Programmation informatique",
    description: "Programme de développement logiciel et systèmes informatiques",
    creerPar: "system",
  },
  {
    nom: "Réseaux et Télécommunications",
    description: "Programme axé sur les infrastructures réseau et communication",
    creerPar: "system",
  },
  {
    nom: "Génie Logiciel",
    description: "Conception et développement d'applications complexes",
    creerPar: "system",
  },
  {
    nom: "Intelligence Artificielle",
    description: "Apprentissage automatique et traitement des données",
    creerPar: "system",
  },
  {
    nom: "Cybersécurité",
    description: "Sécurité des systèmes et protection des données",
    creerPar: "system",
  },
];

const programmesList = [];

for (const programme of programmes) {
  const createdProgramme = await prisma.programme.upsert({
    where: { nom: programme.nom },
    update: {
      description: programme.description,
      modifierPar: "system",
      modifierLe: new Date(),
    },
    create: {
      ...programme,
      creerLe: new Date(),
    },
  });

  programmesList.push(createdProgramme);
}

/*
===========================
SEED COURS_PROGRAMMES
===========================
*/
console.log("Seeding cours_programmes...");

for (let i = 0; i < coursList.length; i++) {
  const cours = coursList[i];
  const programme = programmesList[i % programmesList.length];

  if (!cours || !programme) continue;

  await prisma.cours_Programme.upsert({
    where: {
      coursId_programmeId: {
        coursId: cours.id,
        programmeId: programme.id,
      },
    },
    update: {},
    create: {
      coursId: cours.id,
      programmeId: programme.id,
      creerPar: "system",
      creerLe: new Date(),
    },
  });
}

  const debugPlages = await prisma.plageHoraire.findMany();

  console.log("DEBUG PLAGES:");
  debugPlages.forEach(p => {
    console.log(p.heure_debut, "→", p.heure_fin);
  });

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