# 🧠 Personal OS — Dashboard

> Dashboard personnel tout-en-un pour étudiant-entrepreneur — Dakar 🇸🇳

**🔗 Application en ligne → [lem2003.github.io/personal-os](https://lem2003.github.io/personal-os/)**

---

## Aperçu

Application web progressive (PWA) conçue pour gérer simultanément la vie étudiante et le développement d'un business. Fonctionne entièrement dans le navigateur — aucun compte, aucun serveur, aucun abonnement.

---

## Fonctionnalités

### 🏠 Dashboard
- Salutation dynamique selon l'heure
- **Bannière de pilotage** : météo de la journée (charge calculée), streak de productivité, score des 7 derniers jours
- Objectif principal du moment (éditable)
- Habitudes du jour avec barre de progression
- Top 3 tâches prioritaires
- Résumé du jour : agenda école, dépenses, prochains paiements
- Alertes intelligentes : devoirs urgents, examens proches, abonnements à renouveler

### ✅ Tâches
- Priorités : 🔴 Critique / 🟡 Important / ⚪ Optionnel
- Statuts : À faire → En cours → Terminé
- **Tâches récurrentes** : quotidien, hebdomadaire (jours au choix), mensuel — avec heure de rappel et reset automatique
- Édition inline, filtres par statut et priorité
- Déplacement automatique en Ajustements si deadline dépassée

### 🎯 Projets & Idées
- Suivi de progression calculé depuis les tâches liées
- **Analyse IA** via Claude (Anthropic) : score de faisabilité, priorité recommandée, prochaines étapes

### 📚 École
- Emploi du temps hebdomadaire avec code couleur par matière
- Suivi des devoirs avec badges d'urgence (J-2 / J-7)
- Examens avec tracker de révision par chapitre

### 💰 Finances
- Suivi des dépenses quotidiennes (totaux jour / semaine / mois)
- Graphique par catégorie (CSS pur, sans librairie)
- Budgets par catégorie avec indicateur de dépassement
- Abonnements récurrents avec cycles automatiques (mensuel, trimestriel, annuel)
- Bouton "Payé" qui avance automatiquement au prochain cycle

### 📊 Statistiques
- **Score global** (anneau animé) : note sur 100 calculée sur 4 dimensions — tâches, habitudes, école, discipline
- Tâches des 7 derniers jours (graphique en barres)
- Habitudes récurrentes avec score du jour
- Dépenses sur 4 semaines + top catégories du mois
- Tâches par priorité avec barres de progression
- **Section École** : taux de devoirs rendus, examens J-X, révisions par chapitre
- **Section Projets** : progression de chaque projet actif depuis les tâches liées

### 🔄 Ajustements
- Liste des tâches non terminées à temps
- Reprogrammation avec sélection de raison

---

## Stack technique

| Technologie | Usage |
|---|---|
| React 18 | Interface utilisateur |
| Vite | Build & dev server |
| Tailwind CSS | Styles |
| localStorage | Persistance des données (100% local) |
| Anthropic API | Analyse IA des projets |
| Service Worker | Mode hors ligne (PWA) |
| GitHub Pages + GitHub Actions | Hébergement & déploiement automatique |

---

## Installation locale

```bash
git clone https://github.com/LeM2003/personal-os.git
cd personal-os
npm install
npm run dev
```

Puis ouvrir [http://localhost:5173](http://localhost:5173)

---

## Build & déploiement

L'app est déployée automatiquement via **GitHub Actions** à chaque push sur `main`.

```bash
git add -A
git commit -m "description"
git push
```

Pour un build local :

```bash
npm run build
# Les fichiers sont dans dist/
```

---

## Configuration de l'IA

1. Obtenir une clé API sur [console.anthropic.com](https://console.anthropic.com)
2. Dans l'app → bouton **🔑 Clé API** (bas de la barre latérale)
3. Entrer la clé `sk-ant-...`
4. La clé est stockée uniquement dans votre navigateur (localStorage)

---

## Données

Toutes les données sont stockées localement dans le navigateur (`localStorage`). Aucune donnée n'est envoyée sur un serveur (sauf les requêtes d'analyse IA vers l'API Anthropic).

| Clé | Contenu |
|---|---|
| `pos_profile` | Profil utilisateur (prénom, nom, rôle) |
| `pos_tasks` | Tâches (one-shot et récurrentes) |
| `pos_projects` | Projets & idées |
| `pos_expenses` | Dépenses |
| `pos_subscriptions` | Abonnements |
| `pos_budgets` | Budgets par catégorie |
| `pos_courses` | Emploi du temps |
| `pos_devoirs` | Devoirs |
| `pos_examens` | Examens |
| `pos_adjustments` | Ajustements (tâches en retard) |
| `pos_objectif` | Objectif principal |
| `pos_streak` | Streak de productivité (jours consécutifs) |
| `pos_apikey` | Clé API Anthropic (chiffrée localement) |
| `pos_notif` | Préférences notifications |

---

*Fait avec ❤️ à Dakar par [LeM2003](https://github.com/LeM2003)*
