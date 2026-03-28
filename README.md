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
- Objectif principal du moment (éditable)
- Top 3 tâches prioritaires du jour
- Résumé du jour : agenda école, dépenses, prochains paiements
- Alertes intelligentes : devoirs urgents, examens proches, abonnements à renouveler

### ✅ Tâches
- Priorités : 🔴 Critique / 🟡 Important / ⚪ Optionnel
- Statuts : À faire → En cours → Terminé
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
- Abonnements récurrents avec cycles automatiques (mensuel, trimestriel, annuel)
- Bouton "Payé" qui avance automatiquement au prochain cycle

### 🔄 Ajustements
- Liste des tâches non terminées à temps
- Reprogrammation avec sélection de raison

---

## Stack technique

| Technologie | Usage |
|---|---|
| React 18 (CDN) | Interface utilisateur |
| Tailwind CSS (CDN) | Styles |
| Babel Standalone | Compilation JSX dans le navigateur |
| localStorage | Persistance des données |
| Anthropic API | Analyse IA des projets |
| Service Worker | Mode hors ligne (PWA) |
| GitHub Pages | Hébergement gratuit |

Aucun `npm install`. Aucun build. Un seul fichier `index.html`.

---

## Installation locale

```bash
git clone https://github.com/LeM2003/personal-os.git
cd personal-os
# Ouvrir index.html dans un navigateur
# (ou lancer un serveur local pour que le Service Worker fonctionne)
python3 -m http.server 8080
```

Puis ouvrir [http://localhost:8080](http://localhost:8080)

> ⚠️ Le Service Worker (mode hors ligne) nécessite un serveur HTTP, pas une ouverture directe du fichier.

---

## Configuration de l'IA

1. Obtenir une clé API sur [console.anthropic.com](https://console.anthropic.com)
2. Dans l'app → bouton **🔑 Clé API** (bas de la barre latérale)
3. Entrer la clé `sk-ant-...`
4. La clé est stockée uniquement dans votre navigateur (localStorage)

---

## Déploiement

L'app est déployée automatiquement via **GitHub Pages** à chaque push sur `main`.

```bash
git add -A
git commit -m "description"
git push
```

---

## Données

Toutes les données sont stockées localement dans le navigateur (`localStorage`). Aucune donnée n'est envoyée sur un serveur (sauf les requêtes d'analyse IA vers l'API Anthropic).

| Clé | Contenu |
|---|---|
| `pos_tasks` | Tâches |
| `pos_projects` | Projets |
| `pos_expenses` | Dépenses |
| `pos_subscriptions` | Abonnements |
| `pos_courses` | Cours |
| `pos_devoirs` | Devoirs |
| `pos_examens` | Examens |
| `pos_adjustments` | Ajustements |
| `pos_objectif` | Objectif principal |

---

*Fait avec ❤️ à Dakar — propulsé par [Claude](https://claude.ai)*
