<h1 align="center">📚 Gestion Horaire API</h1>

<p align="center">
  Backend REST API pour la gestion des horaires académiques  
  (cours, professeurs, salles, disponibilités, programmes, etc.)
</p>

<p align="center">
  <img alt="Version" src="https://img.shields.io/badge/version-1.0.0-blue.svg" />
  <img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-yellow.svg" />
  <img alt="Node" src="https://img.shields.io/badge/Node-18+-green" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-blue" />
  <img alt="Fastify" src="https://img.shields.io/badge/Fastify-4-black" />
</p>

---

# 🎯 Objectif du projet

Cette application est une API REST permettant la gestion complète d’un système d’horaires académiques.

Elle permet de gérer :

- Les utilisateurs
- Les rôles
- Les professeurs
- Les cours
- Les programmes
- Les salles
- Les spécialités
- Les disponibilités
- Les plages horaires
- Les séances

Ce projet a été réalisé dans un cadre académique afin de démontrer :

- Une architecture backend modulaire
- Une séparation claire des responsabilités
- L’utilisation d’un ORM moderne (Prisma)
- Une conception scalable et maintenable

---

# 🚀 Stack Technique

- **Node.js**
- **Fastify**
- **TypeScript**
- **Prisma ORM**
- **PostgreSQL**
- **Dotenv**

---

# 🏗️ Architecture Utilisée

## Architecture modulaire par domaine (Feature-based architecture)

Le projet adopte une architecture modulaire orientée domaine.

Chaque entité métier possède son propre module contenant :

- Ses routes
- Son contrôleur
- Son service

Cette approche permet :

- Une meilleure lisibilité
- Une séparation des responsabilités
- Une évolutivité simplifiée
- Une maintenance facilitée

---

## 🔁 Flux de traitement d’une requête

Client → Routes → Controller → Service → Prisma → Base de données

- **Routes** : définissent les endpoints HTTP
- **Controller** : gère la requête et la réponse
- **Service** : contient la logique métier
- **Prisma** : communique avec PostgreSQL

---

# 📁 Structure du Projet

gestion-horaire-api/
│
├── prisma/
│ └── schema.prisma
│
├── src/
│ ├── server.ts
│ ├── app.ts
│ │
│ ├── plugins/
│ │ └── prisma.ts
│ │
│ ├── modules/
│ │ ├── cours/
│ │ ├── cours_programme/
│ │ ├── disponibilité/
│ │ ├── disponibilite_professeur/
│ │ ├── plageHoraire/
│ │ ├── plageHoraire_disponibilite/
│ │ ├── professeur/
│ │ ├── programme/
│ │ ├── rôle/
│ │ ├── salle/
│ │ ├── séance/
│ │ ├── spécialité/
│ │ ├── spécialité_professeur/
│ │ ├── tapezSalle/
│ │ └── utilisateur/
│ │ ├── utilisateur.routes.ts
│ │ ├── utilisateur.controller.ts
│ │ └── utilisateur.service.ts
│ │
│ └── utils/
│
├── .env
├── package.json
├── tsconfig.json
├── prisma.config.ts
└── README.md


---

# 🧩 Description des dossiers et fichiers

## 📦 prisma/

Contient la configuration de la base de données.

- `schema.prisma` : définit les modèles de données et la configuration PostgreSQL.

---

## 📦 src/

Dossier principal contenant le code source.

---

### 🔹 server.ts

Point d’entrée de l’application.

Responsable de :
- Charger les variables d’environnement
- Démarrer le serveur
- Définir le port et l’hôte

---

### 🔹 app.ts

Responsable de :

- Créer l’instance Fastify
- Enregistrer les plugins
- Enregistrer les routes des différents modules

---

### 🔹 plugins/

Contient les plugins Fastify.

- `prisma.ts` : injecte Prisma dans l’instance Fastify pour permettre son utilisation dans toute l’application.

---

### 🔹 modules/

Contient les modules métiers.

Chaque module suit une structure standard :

- `*.routes.ts` → Définition des routes HTTP
- `*.controller.ts` → Gestion des requêtes et réponses
- `*.service.ts` → Logique métier et interaction avec Prisma

Exemple : module utilisateur

- `utilisateur.routes.ts`
- `utilisateur.controller.ts`
- `utilisateur.service.ts`

---

### 🔹 utils/

Contient les fonctions utilitaires réutilisables dans l’application.

---

## 📄 .env

Fichier de configuration des variables d’environnement :

- DATABASE_URL
- PORT

---

## 📄 prisma.config.ts

Configuration personnalisée liée à Prisma si nécessaire.

---

## 📄 tsconfig.json

Configuration TypeScript :

- Compilation vers ES2022
- Module NodeNext
- Typage strict

---

# ⚙️ Installation

```bash
git clone https://github.com/Hermann-cell/Gestion-Horaires-API.git
cd gestion-horaire-api
npm install
```

# Lancement 
- Développement
  npm run dev

- Production
  npm run build
  npm start

# 📌 Points de terminaison principaux
| Ressource   | Endpoint     |
| ----------- | ------------ |
| Utilisateur | /utilisateur |
| Professeur  | /professeur  |
| Salle       | /salle       |
| Cours       | /cours       |
| Programme   | /programme   |
| Séance      | /seance      |

# 🔐 Gestion de la base de données
  - Générer Prisma Client
    npx prisma generate
  - Appliquer une migration
    npx prisma migrate dev

# 🎓 Contexte académique

Ce projet a été réalisé dans le cadre d'un projet académique de fin d'année.

Il vise à démontrer :

La maîtrise de Fastify

L'utilisation d'une architecture backend propre

L'intégration d'un ORM moderne

La conception d'une API REST évolutive




# 👤 Autheurs
- ### Hermann Blondel Njeutsa
  GitHub : https://github.com/Hermann-cell
  LinkedIn : https://www.linkedin.com/in/hermann-njeutsa-6739601b9/

- ### Liliane Claire Kana Ngningha
  GitHub : 
  LinkedIn : 

- ### Albert Boyomo Ngnama
  GitHub :
  LinkedIn : 

# 📜 Licence
Ce projet est sous licence propriétaire.
Voir le fichier LICENSE pour plus d’informations.

## Show your support
Give a ⭐️ if this project helped you!



