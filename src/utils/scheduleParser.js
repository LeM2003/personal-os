import { genId } from './dates'
import { COURSE_PALETTE } from './constants'

const DAY_MAP = {
  lundi: 'Lundi', lun: 'Lundi',
  mardi: 'Mardi', mar: 'Mardi',
  mercredi: 'Mercredi', mer: 'Mercredi',
  jeudi: 'Jeudi', jeu: 'Jeudi',
  vendredi: 'Vendredi', ven: 'Vendredi',
  samedi: 'Samedi', sam: 'Samedi',
  dimanche: 'Dimanche', dim: 'Dimanche',
}

const DAY_REGEX = /\b(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche|lun|mar|mer|jeu|ven|sam|dim)\b\.?/i
const DAY_ONLY_LINE = /^(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche|lun|mar|mer|jeu|ven|sam|dim)\b\.?[:\s]*$/i
const TIME_TOKEN = /(\d{1,2})\s*(?:h|:)\s*(\d{2})?/i
const TIME_RANGE = /(\d{1,2})\s*(?:h|:)\s*(\d{2})?\s*(?:-|–|—|à|a|to|>)\s*(\d{1,2})\s*(?:h|:)?\s*(\d{2})?/i

const pad2 = n => String(n).padStart(2, '0')
const toHM = (h, m) => `${pad2(h)}:${pad2(m || 0)}`

function normalizeDay(raw) {
  if (!raw) return null
  const key = raw.toLowerCase().replace(/\.$/, '').trim()
  return DAY_MAP[key] || null
}

function extractTimes(line) {
  const range = line.match(TIME_RANGE)
  if (range) {
    const h1 = parseInt(range[1], 10), m1 = parseInt(range[2] || '0', 10)
    const h2 = parseInt(range[3], 10), m2 = parseInt(range[4] || '0', 10)
    if (h1 < 0 || h1 > 23 || h2 < 0 || h2 > 23) return null
    return { start: toHM(h1, m1), end: toHM(h2, m2), matched: range[0] }
  }
  const single = line.match(TIME_TOKEN)
  if (single) {
    const h1 = parseInt(single[1], 10), m1 = parseInt(single[2] || '0', 10)
    if (h1 < 0 || h1 > 23) return null
    const h2 = Math.min(h1 + 1, 23)
    return { start: toHM(h1, m1), end: toHM(h2, m1), matched: single[0] }
  }
  return null
}

function cleanToken(str) {
  return str
    .replace(/\s{2,}/g, ' ')
    .replace(/^[\s·•|\-–—,:]+|[\s·•|\-–—,:]+$/g, '')
    .trim()
}

function parseLine(line) {
  const dayMatch = line.match(DAY_REGEX)
  const jour = dayMatch ? normalizeDay(dayMatch[0]) : null
  if (!jour) return null

  const times = extractTimes(line)
  if (!times) return null

  let rest = line.replace(dayMatch[0], ' ').replace(times.matched, ' ')
  const parts = rest
    .split(/\s*[·•|]\s*|\s+[-–—]\s+/)
    .map(cleanToken)
    .filter(Boolean)

  if (parts.length === 0) return null

  let nom = parts[0]
  let salle = ''
  let professeur = ''

  for (let i = 1; i < parts.length; i++) {
    const p = parts[i]
    if (/^(salle|room|b[aâ]t|amphi)/i.test(p)) {
      salle = p.replace(/^(salle|room)[\s:]*/i, '')
    } else if (/^(prof|mr|mme|m\.|dr)\b/i.test(p)) {
      professeur = p
    } else if (!salle) {
      salle = p
    } else if (!professeur) {
      professeur = p
    }
  }

  return { nom, jour, heureDebut: times.start, heureFin: times.end, salle, professeur }
}

export function parseSchedule(text) {
  if (!text || typeof text !== 'string') return []
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean)

  const results = []
  let currentDay = null

  for (const line of lines) {
    const dayOnly = line.match(DAY_ONLY_LINE)
    if (dayOnly) {
      currentDay = normalizeDay(dayOnly[1])
      continue
    }

    let course = parseLine(line)
    if (!course && currentDay) {
      course = parseLine(`${currentDay} ${line}`)
    }
    if (course) results.push(course)
  }

  return results.map((c, i) => ({
    ...c,
    id: genId(),
    color: COURSE_PALETTE[i % COURSE_PALETTE.length],
    dateDebut: null,
    dateFin: null,
  }))
}
