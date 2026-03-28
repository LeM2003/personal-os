export const genId = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36)

export const todayISO = () => new Date().toISOString().split('T')[0]

export const fmtDate = (iso) => {
  if (!iso) return '—'
  const d = new Date(iso + 'T00:00:00')
  if (isNaN(d)) return iso
  return d.toLocaleDateString('fr-FR')
}

export const daysUntil = (iso) => {
  if (!iso) return Infinity
  const d = new Date(iso + 'T00:00:00')
  const now = new Date(); now.setHours(0, 0, 0, 0)
  return Math.ceil((d - now) / 86400000)
}

export const todayLabel = () =>
  new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

export const greeting = () => {
  const h = new Date().getHours()
  if (h < 5)  return 'Bonne nuit'
  if (h < 12) return 'Bonjour'
  if (h < 18) return 'Bon après-midi'
  return 'Bonsoir'
}

const JOURS_FR = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
export const todayDay = () => JOURS_FR[new Date().getDay()]
