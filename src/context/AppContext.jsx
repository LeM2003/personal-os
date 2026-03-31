import { createContext, useContext, useEffect } from 'react'
import { useLS } from '../hooks/useLocalStorage'
import { genId, todayISO, nextOccurrenceDate } from '../utils/dates'
import { SAMPLE_TASKS, SAMPLE_PROJECTS, SAMPLE_COURSES, SAMPLE_DEVOIRS,
         SAMPLE_EXAMENS, SAMPLE_EXPENSES, SAMPLE_SUBS } from '../data/sampleData'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  // ── Données persistées ──────────────────────────────────
  const [tasks,         setTasks]         = useLS('pos_tasks',         SAMPLE_TASKS)
  const [projects,      setProjects]      = useLS('pos_projects',      SAMPLE_PROJECTS)
  const [expenses,      setExpenses]      = useLS('pos_expenses',      SAMPLE_EXPENSES)
  const [subscriptions, setSubscriptions] = useLS('pos_subscriptions', SAMPLE_SUBS)
  const [budgets,       setBudgets]       = useLS('pos_budgets',       {})
  const [objectif,      setObjectif]      = useLS('pos_objectif',      'Lancer ma chaîne TikTok et valider mon semestre avec mention')
  const [adjustments,   setAdjustments]   = useLS('pos_adjustments',   [])
  const [courses,       setCourses]       = useLS('pos_courses',       SAMPLE_COURSES)
  const [devoirs,       setDevoirs]       = useLS('pos_devoirs',       SAMPLE_DEVOIRS)
  const [examens,       setExamens]       = useLS('pos_examens',       SAMPLE_EXAMENS)
  const [profile,       setProfile]       = useLS('pos_profile',       null)
  const [apiKey,        setApiKey]        = useLS('pos_apikey',        '')
  const [notifEnabled,  setNotifEnabled]  = useLS('pos_notif',         false)

  // ── Reset tâches récurrentes au cycle suivant ───────────
  useEffect(() => {
    const today = todayISO()
    setTasks(prev => prev.map(t => {
      if (!t.recurring || t.status !== 'Terminé') return t
      if (t.lastCompletedAt && t.lastCompletedAt < today) {
        const nextDate = nextOccurrenceDate(t, t.lastCompletedAt)
        return { ...t, status: 'À faire', deadline: nextDate, lastCompletedAt: null }
      }
      return t
    }))
  }, []) // eslint-disable-line

  // ── Auto-move tâches en retard → Ajustements ───────────
  useEffect(() => {
    const now = todayISO()
    const overdue = tasks.filter(t => t.deadline && t.deadline < now && t.status !== 'Terminé' && !t.recurring)
    if (!overdue.length) return
    const ids = new Set(overdue.map(t => t.id))
    setTasks(prev => prev.filter(t => !ids.has(t.id)))
    setAdjustments(prev => {
      const existIds = new Set(prev.map(a => a.taskId))
      const news = overdue.filter(t => !existIds.has(t.id)).map(t => ({
        id: genId(), taskId: t.id, taskName: t.name,
        originalDeadline: t.deadline, reason: 'manque de temps',
        newDate: '', originalTask: { ...t },
      }))
      return [...prev, ...news]
    })
  }, []) // eslint-disable-line

  // ── Export / Import JSON ────────────────────────────────
  const exportData = () => {
    const data = {
      version: 1, exportedAt: new Date().toISOString(),
      profile, tasks, projects, expenses, subscriptions,
      objectif, adjustments, courses, devoirs, examens,
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `personal-os-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const importData = (file, onDone) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result)
        if (!data.version) { alert('Fichier invalide.'); return }
        if (data.profile)       setProfile(data.profile)
        if (data.tasks)         setTasks(data.tasks)
        if (data.projects)      setProjects(data.projects)
        if (data.expenses)      setExpenses(data.expenses)
        if (data.subscriptions) setSubscriptions(data.subscriptions)
        if (data.objectif)      setObjectif(data.objectif)
        if (data.adjustments)   setAdjustments(data.adjustments)
        if (data.courses)       setCourses(data.courses)
        if (data.devoirs)       setDevoirs(data.devoirs)
        if (data.examens)       setExamens(data.examens)
        onDone?.()
        alert('✅ Données restaurées avec succès !')
      } catch { alert('Erreur : fichier JSON corrompu.') }
    }
    reader.readAsText(file)
  }

  const value = {
    // Data
    tasks, setTasks,
    projects, setProjects,
    expenses, setExpenses,
    subscriptions, setSubscriptions,
    budgets, setBudgets,
    objectif, setObjectif,
    adjustments, setAdjustments,
    courses, setCourses,
    devoirs, setDevoirs,
    examens, setExamens,
    profile, setProfile,
    apiKey, setApiKey,
    notifEnabled, setNotifEnabled,
    // Actions
    exportData,
    importData,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export const useApp = () => {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp doit être utilisé dans <AppProvider>')
  return ctx
}
