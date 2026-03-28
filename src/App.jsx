import { useState, useEffect } from 'react'
import { useLS } from './hooks/useLocalStorage'
import { genId, todayISO } from './utils/dates'
import { SAMPLE_TASKS, SAMPLE_PROJECTS, SAMPLE_COURSES, SAMPLE_DEVOIRS,
         SAMPLE_EXAMENS, SAMPLE_EXPENSES, SAMPLE_SUBS } from './data/sampleData'
import Dashboard from './components/Dashboard'
import Taches from './components/Taches'
import Projets from './components/Projets'
import Ecole from './components/Ecole'
import Finances from './components/Finances'
import Ajustements from './components/Ajustements'

const TABS = [
  { id: 'dashboard',   icon: '🏠', label: 'Dashboard'      },
  { id: 'taches',      icon: '✅', label: 'Tâches'          },
  { id: 'projets',     icon: '🎯', label: 'Projets & Idées' },
  { id: 'ecole',       icon: '📚', label: 'École'           },
  { id: 'finances',    icon: '💰', label: 'Finances'        },
  { id: 'ajustements', icon: '🔄', label: 'Ajustements'     },
]

export default function App() {
  const [tab, setTab] = useState('dashboard')
  const [apiKey, setApiKey]         = useLS('pos_apikey', '')
  const [apiModal, setApiModal]     = useState(false)

  const [tasks,         setTasks]         = useLS('pos_tasks',         SAMPLE_TASKS)
  const [projects,      setProjects]      = useLS('pos_projects',      SAMPLE_PROJECTS)
  const [expenses,      setExpenses]      = useLS('pos_expenses',      SAMPLE_EXPENSES)
  const [subscriptions, setSubscriptions] = useLS('pos_subscriptions', SAMPLE_SUBS)
  const [objectif,      setObjectif]      = useLS('pos_objectif',      'Lancer ma chaîne TikTok et valider mon semestre avec mention')
  const [adjustments,   setAdjustments]   = useLS('pos_adjustments',   [])
  const [courses,       setCourses]       = useLS('pos_courses',       SAMPLE_COURSES)
  const [devoirs,       setDevoirs]       = useLS('pos_devoirs',       SAMPLE_DEVOIRS)
  const [examens,       setExamens]       = useLS('pos_examens',       SAMPLE_EXAMENS)

  /* Auto-move overdue tasks → Ajustements */
  useEffect(() => {
    const now = todayISO()
    const overdue = tasks.filter(t => t.deadline && t.deadline < now && t.status !== 'Terminé')
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

  const shared = {
    tasks, setTasks, projects, setProjects, expenses, setExpenses,
    subscriptions, setSubscriptions, objectif, setObjectif,
    adjustments, setAdjustments, courses, setCourses,
    devoirs, setDevoirs, examens, setExamens,
    apiKey, setTab,
  }

  const adjBadge = adjustments.length > 0 && (
    <span style={{ background: '#f87171', color: '#fff', borderRadius: '50%', width: 18, height: 18,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, marginLeft: 'auto' }}>
      {adjustments.length}
    </span>
  )

  return (
    <div>
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div style={{ paddingLeft: 8, marginBottom: 28 }}>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: '#F5C518', letterSpacing: '-0.5px' }}>Personal OS</h1>
          <p style={{ color: 'var(--muted)', fontSize: 11, marginTop: 3 }}>Dashboard Pro · Dakar</p>
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
          {TABS.map(t => (
            <div key={t.id} className={`nav-item${tab === t.id ? ' active' : ''}`} onClick={() => setTab(t.id)}>
              <span className="nav-icon">{t.icon}</span>
              <span style={{ flex: 1 }}>{t.label}</span>
              {t.id === 'ajustements' && adjustments.length > 0 && adjBadge}
            </div>
          ))}
        </nav>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, marginTop: 12 }}>
          <button className="btn-ghost" style={{ width: '100%', fontSize: 12, padding: '8px 12px' }}
            onClick={() => setApiModal(true)}>
            🔑 Clé API Anthropic
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="main-content">
        <div className="page-enter" key={tab}>
          {tab === 'dashboard'   && <Dashboard   {...shared} />}
          {tab === 'taches'      && <Taches      tasks={tasks} setTasks={setTasks} adjustments={adjustments} setAdjustments={setAdjustments} />}
          {tab === 'projets'     && <Projets     tasks={tasks} projects={projects} setProjects={setProjects} apiKey={apiKey} />}
          {tab === 'ecole'       && <Ecole       courses={courses} setCourses={setCourses} devoirs={devoirs} setDevoirs={setDevoirs} examens={examens} setExamens={setExamens} />}
          {tab === 'finances'    && <Finances    expenses={expenses} setExpenses={setExpenses} subscriptions={subscriptions} setSubscriptions={setSubscriptions} />}
          {tab === 'ajustements' && <Ajustements adjustments={adjustments} setAdjustments={setAdjustments} tasks={tasks} setTasks={setTasks} />}
        </div>
      </main>

      {/* BOTTOM NAV (mobile) */}
      <nav className="bottom-nav">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: 2, padding: '4px 8px',
              color: tab === t.id ? '#F5C518' : 'var(--muted)', position: 'relative' }}>
            <span style={{ fontSize: 20 }}>{t.icon}</span>
            <span style={{ fontSize: 9, fontFamily: 'DM Sans', fontWeight: 500 }}>{t.label.split(' ')[0]}</span>
            {t.id === 'ajustements' && adjustments.length > 0 && (
              <span style={{ position: 'absolute', top: 0, right: 0, background: '#f87171', color: '#fff',
                borderRadius: '50%', width: 14, height: 14, fontSize: 9,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                {adjustments.length}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* API KEY MODAL */}
      {apiModal && (
        <div className="modal-overlay" onClick={() => setApiModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 18, marginBottom: 8, color: '#F5C518' }}>🔑 Clé API Anthropic</h3>
            <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 16, lineHeight: 1.6 }}>
              Votre clé API est stockée uniquement dans votre navigateur (localStorage).<br />
              Obtenez-la sur <strong style={{ color: 'var(--text)' }}>console.anthropic.com</strong>
            </p>
            <input type="password" value={apiKey} onChange={e => setApiKey(e.target.value)}
              placeholder="sk-ant-api03-..." style={{ marginBottom: 16 }} />
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn-gold" onClick={() => setApiModal(false)}>Enregistrer</button>
              <button className="btn-ghost" onClick={() => setApiModal(false)}>Fermer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
