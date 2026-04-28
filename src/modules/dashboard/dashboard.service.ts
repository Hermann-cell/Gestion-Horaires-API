import { FastifyInstance } from "fastify";

type DayLabel =
  | "Lundi"
  | "Mardi"
  | "Mercredi"
  | "Jeudi"
  | "Vendredi"
  | "Samedi"
  | "Dimanche";

const DAY_ORDER: DayLabel[] = [
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
  "Dimanche",
];

function toDayLabel(date: Date): DayLabel {
  const labels: DayLabel[] = [
    "Dimanche",
    "Lundi",
    "Mardi",
    "Mercredi",
    "Jeudi",
    "Vendredi",
    "Samedi",
  ];

  return labels[date.getDay()] as DayLabel;
}

function formatDateKey(date: Date): string {
  return date.toISOString().split("T")[0]!;
}

function formatHour(date: Date): string {
  return new Date(date).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatHourInt(hour: number): string {
  return `${String(hour).padStart(2, "0")}:00`;
}

export async function getDashboardStats(app: FastifyInstance) {
  const seanceInclude = {
    cours: true,
    salle: {
      include: {
        typeDeSalle: true,
      },
    },
    professeur: true,
    plageHoraire: true,
  } as const;

  const [
    totalProfesseurs,
    totalSalles,
    totalCours,
    totalSeances,
    seancesSansProfesseur,
    allSeances,
    salles,
  ] = await Promise.all([
    app.prisma.professeur.count({
      where: { supprimeLe: null },
    }),
    app.prisma.salle.count({
      where: { supprimeLe: null },
    }),
    app.prisma.cours.count({
      where: {
        supprimeLe: null,
        est_harchive: false,
      },
    }),
    app.prisma.seance.count({
      where: { supprimeLe: null },
    }),
    app.prisma.seance.count({
      where: {
        supprimeLe: null,
        professeurId: null,
      },
    }),
    app.prisma.seance.findMany({
      where: { supprimeLe: null },
      include: seanceInclude,
      orderBy: [{ date: "asc" }, { plageHoraireId: "asc" }],
    }),
    app.prisma.salle.findMany({
      where: { supprimeLe: null },
      select: {
        id: true,
        nom: true,
        code: true,
      },
      orderBy: {
        nom: "asc",
      },
    }),
  ]);

  const tauxAffectationProfesseurs =
    totalSeances === 0
      ? 0
      : Math.round(
          ((totalSeances - seancesSansProfesseur) / totalSeances) * 100
        );

  const salleNameById = new Map<number, string>(
    salles.map((salle) => [salle.id, salle.nom?.trim() || salle.code])
  );

  const seancesParSalleMap = new Map<string, number>();
  const seancesParJourMap = new Map<DayLabel, number>(
    DAY_ORDER.map((day) => [day, 0])
  );
  const seancesParDateMap = new Map<string, number>();

  for (const seance of allSeances) {
    const salleLabel =
      salleNameById.get(seance.salleId) ?? `Salle ${seance.salleId}`;

    seancesParSalleMap.set(
      salleLabel,
      (seancesParSalleMap.get(salleLabel) || 0) + 1
    );

    const dayLabel = toDayLabel(new Date(seance.date));
    seancesParJourMap.set(dayLabel, (seancesParJourMap.get(dayLabel) || 0) + 1);

    const dateKey = formatDateKey(new Date(seance.date));
    seancesParDateMap.set(dateKey, (seancesParDateMap.get(dateKey) || 0) + 1);
  }

  const seancesParSalle = Array.from(seancesParSalleMap.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  const seancesParJour = DAY_ORDER.map((label) => ({
    label,
    value: seancesParJourMap.get(label) || 0,
  }));

  const chargeGlobale = Array.from(seancesParDateMap.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => a.label.localeCompare(b.label))
    .slice(-7);

  // Afficher les 6 séances les plus récentes sur le dashboard
  const dashboardSeances = [...allSeances]
    .sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();

      if (dateA !== dateB) {
        return dateB - dateA;
      }

      // Les heures sont maintenant des INT (8-22)
      const heureA = a.plageHoraire.heure_debut;
      const heureB = b.plageHoraire.heure_debut;

      return heureB - heureA;
    })
    .slice(0, 6);

  return {
    cards: {
      totalProfesseurs,
      totalSalles,
      totalCours,
      totalSeances,
      seancesSansProfesseur,
      tauxAffectationProfesseurs,
    },
    charts: {
      seancesParSalle,
      seancesParJour,
      repartitionAffectationProfesseurs: [
        {
          label: "Avec professeur",
          value: totalSeances - seancesSansProfesseur,
        },
        {
          label: "Sans professeur",
          value: seancesSansProfesseur,
        },
      ],
      chargeGlobale,
    },
    prochainesSeances: dashboardSeances.map((seance) => ({
      id: seance.id,
      date: seance.date,
      cours: seance.cours.nom,
      salle: seance.salle.nom,
      salleCode: seance.salle.code,
      professeur: seance.professeur
        ? `${seance.professeur.prenom} ${seance.professeur.nom ?? ""}`.trim()
        : null,
      heureDebut: formatHourInt(seance.plageHoraire.heure_debut),
      heureFin: formatHourInt(seance.plageHoraire.heure_fin),
      typeSalle: seance.salle.typeDeSalle.nom,
    })),
  };
}