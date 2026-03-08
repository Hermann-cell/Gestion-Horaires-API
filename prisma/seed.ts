import "dotenv/config";
import bcrypt from "bcrypt";
import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;

// Prisma gère la connexion via la datasource postgres définie dans schema.prisma
export const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: connectionString,
  }),
});

async function main() {
  console.log("Seeding roles...");

  const roles = [
    { nom: "Administrateur", description: "Accès complet au système" },
    { nom: "Responsable administratif", description: "Gère les utilisateurs et plannings" },
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

  console.log("Seeding users...");

  const users = [
    { nom: "Liliane", prenom: "Liliane", email: "liliane@email.com", roleNom: "Administrateur" },
    { nom: "Hermann", prenom: "Hermann", email: "hermann@email.com", roleNom: "Responsable administratif" },
    { nom: "Albert", prenom: "Albert", email: "albert@email.com", roleNom: "Administrateur" },
  ];

  for (const u of users) {
    const role = await prisma.role.findUnique({ where: { nom: u.roleNom } });
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
        roleId: role.id,
        creerPar: "system",
        creerLe: new Date(),
      },
    });
  }

  console.log("Seed completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });