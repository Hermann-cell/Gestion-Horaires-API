import "dotenv/config";
import bcrypt from "bcrypt";
import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;

export const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: connectionString || "",
  }),
});

async function main() {
  // --- ROLES ---
  console.log("Seeding roles...");
  const roles = [
    { nom: "Administrateur", description: "Accès complet" },
    { nom: "Responsable administratif", description: "Gère les plannings" },
  ];
  for (const r of roles) {
    await prisma.role.upsert({ 
      where: { nom: r.nom }, 
      update: {}, 
      create: { ...r, creerPar: "system" } 
    });
  }

  // --- USERS ---
  console.log("Seeding users...");
  const roleAdmin = await prisma.role.findUnique({ where: { nom: "Administrateur" } });
  if (!roleAdmin) throw new Error("Role Admin introuvable");

  const hashedPwd = await bcrypt.hash("Default123!", 10);
  await prisma.user.upsert({
    where: { email: "liliane@gmail.com" },
    update: {},
    create: {
      nom: "Kana",
      prenom: "Liliane",
      email: "liliane@gmail.com",
      mot_de_passe: hashedPwd,
      statut: true,
      roleId: roleAdmin.id,
      creerPar: "system",
    },
  });

  // --- TYPES DE SALLE & SALLES ---
  console.log("Seeding rooms...");
  const typeLabo = await prisma.typeDeSalle.upsert({
    where: { nom: "Laboratoire" },
    update: {},
    create: { nom: "Laboratoire", creerPar: "system" },
  });

  await prisma.salle.upsert({
    where: { code: "LAB01" },
    update: {},
    create: { 
        code: "LAB01", 
        nom: "Laboratoire Info 1", 
        capacite: 24, 
        typeDeSalleId: typeLabo.id, 
        creerPar: "system" 
    },
  });

  // --- SPECIALITES ---
  console.log("Seeding specialites...");
  let specInfo = await prisma.specialite.findFirst({ where: { nom: "Informatique" } });
  if (!specInfo) {
    specInfo = await prisma.specialite.create({
      data: { nom: "Informatique", creerPar: "system" }
    });
  }

  // --- PROFESSEURS ---
  console.log("Seeding profs...");
  const prof = await prisma.professeur.upsert({
    where: { matricule: "PROF001" },
    update: {},
    create: { nom: "Dupont", prenom: "Jean", matricule: "PROF001", creerPar: "system" },
  });

  // --- COURS ---
  console.log("Seeding cours...");
  const coursData = {
    nom: "Algorithmique",
    code: "INFO101",
    duree: 60,
    etape: 1,
    creerPar: "system",
    ...(specInfo?.id ? { specialiteId: specInfo.id } : {})
  };

  await prisma.cours.upsert({
    where: { code: "INFO101" },
    update: {},
    create: coursData,
  });

  // --- DISPONIBILITÉS & PLAGES ---
  console.log("Seeding availability...");
  const jours = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"];
  for (const j of jours) {
    let disp = await prisma.disponibilite.findFirst({ where: { jour: j } });
    if (!disp) {
      disp = await prisma.disponibilite.create({ data: { jour: j, creerPar: "system" } });
    }

    // Création de deux créneaux par jour
    const slots = [8, 14]; 
    for (const startHour of slots) {
      const hD = new Date(); hD.setHours(startHour, 0, 0, 0);
      const hF = new Date(); hF.setHours(startHour + 2, 0, 0, 0);

      let plage = await prisma.plageHoraire.findFirst({
        where: { heure_debut: hD, heure_fin: hF }
      });

      if (!plage) {
        plage = await prisma.plageHoraire.create({
          data: { heure_debut: hD, heure_fin: hF, statut: true, creerPar: "system" }
        });
      }

      const linkExists = await prisma.plageHoraire_Disponibilite.findFirst({
        where: { plageHoraireId: plage.id, disponibiliteId: disp.id }
      });

      if (!linkExists) {
        await prisma.plageHoraire_Disponibilite.create({
          data: { plageHoraireId: plage.id, disponibiliteId: disp.id, creerPar: "system" }
        });
      }
    }
  }

  // --- SEANCES (MULTIPLES) ---
  console.log("Seeding multiple seances...");
  const allCours = await prisma.cours.findMany();
  const allSalles = await prisma.salle.findMany();
  const allPlages = await prisma.plageHoraire.findMany();

  // Correction de l'erreur 'possibly undefined' en vérifiant que les listes ne sont pas vides
  if (allCours.length > 0 && allSalles.length > 0 && allPlages.length > 0) {
    
    for (let i = 0; i < 10; i++) {
      const c = allCours[i % allCours.length]!;
      const s = allSalles[i % allSalles.length]!;
      const pl = allPlages[i % allPlages.length]!;
      
      const dateSeance = new Date();
      dateSeance.setDate(dateSeance.getDate() + (i % 5)); // Répartit sur 5 jours

      // 4 séances libres (null) pour tester l'affectation, les autres affectées au prof
      const targetProfId = i < 4 ? null : prof.id;

      const seanceExist = await prisma.seance.findFirst({
        where: { 
          coursId: c.id, 
          plageHoraireId: pl.id,
          date: dateSeance 
        }
      });

      if (!seanceExist) {
        await prisma.seance.create({
          data: {
            date: dateSeance,
            coursId: c.id,
            salleId: s.id,
            plageHoraireId: pl.id,
            professeurId: targetProfId,
            creerPar: "system"
          }
        });
      }
    }
  }

  console.log("Seed completed successfully with multiple seances!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });