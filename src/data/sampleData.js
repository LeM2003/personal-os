import { genId, todayISO } from '../utils/dates'

const future = (days) => {
  const d = new Date(); d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

export const SAMPLE_TASKS = [
  { id: genId(), name: 'Créer 3 vidéos TikTok éducatives', project: 'Chaîne TikTok', priority: 'Critique',
    duration: 120, deadline: future(2), flexible: false, status: 'En cours', createdAt: todayISO() },
  { id: genId(), name: 'Réviser Bases de données — Chap. 3', project: 'École', priority: 'Important',
    duration: 90, deadline: future(4), flexible: true, status: 'À faire', createdAt: todayISO() },
]

export const SAMPLE_PROJECTS = [
  { id: genId(), name: 'Chaîne TikTok Éducation Business',
    objective: 'Atteindre 10 000 abonnés avec du contenu business & entrepreneuriat africain',
    targetDate: future(90), aiAnalysis: null, createdAt: todayISO() },
]

export const SAMPLE_COURSES = [
  { id: genId(), nom: 'Bases de données', jour: 'Lundi',    heureDebut: '08:00', heureFin: '10:00', salle: 'Salle 203', professeur: 'M. Diallo',  color: '#6366f1' },
  { id: genId(), nom: 'Algorithmes',      jour: 'Mardi',    heureDebut: '10:00', heureFin: '12:00', salle: 'Labo Info', professeur: 'Mme. Ndiaye', color: '#ec4899' },
  { id: genId(), nom: 'Réseaux',          jour: 'Mercredi', heureDebut: '14:00', heureFin: '16:00', salle: 'Salle 105', professeur: 'M. Sow',      color: '#14b8a6' },
  { id: genId(), nom: 'Maths Discrètes',  jour: 'Jeudi',    heureDebut: '08:00', heureFin: '10:00', salle: 'Amphi A',   professeur: 'M. Ba',        color: '#f59e0b' },
]

export const SAMPLE_DEVOIRS = [
  { id: genId(), matiere: 'Bases de données', description: 'TP Modélisation UML — Système de bibliothèque',
    dateRendu: future(3), statut: 'À faire', priorite: 'Important' },
]

export const SAMPLE_EXAMENS = [
  { id: genId(), matiere: 'Algorithmes', date: future(14),
    heure: '08:00', salle: 'Grand Amphi', chapitres: 'Tri, Graphes, Arbres binaires', totalChapitres: 3, chapitresRevises: 1 },
]

export const SAMPLE_EXPENSES = [
  { id: genId(), amount: 2500, category: 'Nourriture', date: todayISO(), type: 'Variable', note: 'Déjeuner café numérique' },
  { id: genId(), amount: 500,  category: 'Transport',  date: todayISO(), type: 'Variable', note: 'Bus université' },
]

export const SAMPLE_SUBS = [
  { id: genId(), name: 'Claude Pro', amount: 13000, startDate: '2025-03-23', cycle: 'Mensuel',  category: 'Business',
    nextRenewal: future(5) },
  { id: genId(), name: 'Canva Pro',  amount:  6000, startDate: '2025-03-08', cycle: 'Mensuel',  category: 'Business',
    nextRenewal: future(20) },
]
