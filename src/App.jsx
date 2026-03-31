import { useState, useEffect, useRef, useCallback } from 'react'
import { useLS } from './hooks/useLocalStorage'
import { genId, todayISO, nextOccurrenceDate } from './utils/dates'
import { SAMPLE_TASKS, SAMPLE_PROJECTS, SAMPLE_COURSES, SAMPLE_DEVOIRS,
         SAMPLE_EXAMENS, SAMPLE_EXPENSES, SAMPLE_SUBS } from './data/sampleData'
import Dashboard from './components/Dashboard'
import Taches from './components/Taches'
import Projets from './components/Projets'
import Ecole from './components/Ecole'
import Finances from './components/Finances'
import Ajustements from './components/Ajustements'
import Stats from './components/Stats'

const TABS = [
  { id: 'dashboard',   icon: '🏠', label: 'Dashboard'      },
  { id: 'taches',      icon: '✅', label: 'Tâches'          },
  { id: 'projets',     icon: '🎯', label: 'Projets & Idées' },
  { id: 'ecole',       icon: '📚', label: 'École'           },
  { id: 'finances',    icon: '💰', label: 'Finances'        },
  { id: 'stats',       icon: '📊', label: 'Statistiques'    },
  { id: 'ajustements', icon: '🔄', label: 'Ajustements'     },
]

function SetupModal({ onSave }) {
  const [form, setForm] = useState({ prenom: '', nom: '', role: 'Étudiant-entrepreneur' })
  const save = () => {
    if (!form.prenom.trim()) return
    onSave(form)
  }
  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }}>
      <div className="modal-box">
        <h3 style={{ fontSize: 22, marginBottom: 4, color: '#F5C518' }}>👋 Bienvenue sur Personal OS</h3>
        <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 24, lineHeight: 1.6 }}>
          Commence par te présenter. Ces infos restent dans ton navigateur.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input value={form.prenom} onChange={e => setForm({ ...form, prenom: e.target.value })}
            placeholder="Prénom *" autoFocus />
          <input value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })}
            placeholder="Nom (optionnel)" />
          <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
            <option>Étudiant-entrepreneur</option>
            <option>Étudiant</option>
            <option>Entrepreneur</option>
            <option>Freelance</option>
            <option>Autre</option>
          </select>
        </div>
        <button className="btn-gold" style={{ width: '100%', marginTop: 20 }} onClick={save}
          disabled={!form.prenom.trim()}>
          Commencer →
        </button>
      </div>
    </div>
  )
}

function ProfileModal({ profile, onSave, onClose }) {
  const [form, setForm] = useState({ prenom: profile?.prenom || '', nom: profile?.nom || '', role: profile?.role || 'Étudiant-entrepreneur' })
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <h3 style={{ fontSize: 18, marginBottom: 16, color: '#F5C518' }}>👤 Mon profil</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input value={form.prenom} onChange={e => setForm({ ...form, prenom: e.target.value })} placeholder="Prénom *" autoFocus />
          <input value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} placeholder="Nom (optionnel)" />
          <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
            <option>Étudiant-entrepreneur</option>
            <option>Étudiant</option>
            <option>Entrepreneur</option>
            <option>Freelance</option>
            <option>Autre</option>
          </select>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
          <button className="btn-gold" onClick={() => onSave(form)} disabled={!form.prenom.trim()}>Enregistrer</button>
          <button className="btn-ghost" onClick={onClose}>Annuler</button>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [tab, setTab] = useState('dashboard')
  const [apiKey, setApiKey]         = useLS('pos_apikey', '')
  const [profile, setProfile]       = useLS('pos_profile', null)
  const [apiModal, setApiModal]     = useState(false)
  const [profileModal, setProfileModal] = useState(false)
  const [backupModal, setBackupModal]   = useState(false)
  const importRef = useRef(null)

  const [tasks,         setTasks]         = useLS('pos_tasks',         SAMPLE_TASKS)
  const [projects,      setProjects]      = useLS('pos_projects',      SAMPLE_PROJECTS)
  const [expenses,      setExpenses]      = useLS('pos_expenses',      SAMPLE_EXPENSES)
  const [subscriptions, setSubscriptions] = useLS('pos_subscriptions', SAMPLE_SUBS)
  const [budgets,       setBudgets]       = useLS('pos_budgets',       {})
  const [notifEnabled,  setNotifEnabled]  = useLS('pos_notif',          false)
  const [objectif,      setObjectif]      = useLS('pos_objectif',      'Lancer ma chaîne TikTok et valider mon semestre avec mention')
  const [adjustments,   setAdjustments]   = useLS('pos_adjustments',   [])
  const [courses,       setCourses]       = useLS('pos_courses',       SAMPLE_COURSES)
  const [devoirs,       setDevoirs]       = useLS('pos_devoirs',       SAMPLE_DEVOIRS)
  const [examens,       setExamens]       = useLS('pos_examens',       SAMPLE_EXAMENS)
  const [streakData,    setStreakData]    = useLS('pos_streak',        { count: 0, lastDate: '' })

  /* Reset des tâches récurrentes terminées au prochain cycle */
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

  /* Auto-move overdue tasks → Ajustements (exclut les récurrentes) */
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

  /* ── Notifications ── */
  const NOTIF_ICON = '/personal-os/icons/icon-192.png'
  const notifSupported = typeof Notification !== 'undefined'

  const notify = useCallback((title, body) => {
    if (!notifEnabled || !notifSupported || Notification.permission !== 'granted') return
    new Notification(title, { body, icon: NOTIF_ICON, badge: NOTIF_ICON })
  }, [notifEnabled, notifSupported])

  const enableNotifications = async () => {
    if (!notifSupported) { alert('Ton navigateur ne supporte pas les notifications.'); return }
    const perm = await Notification.requestPermission()
    if (perm === 'granted') {
      setNotifEnabled(true)
      new Notification('Personal OS 🔔', { body: 'Notifications activées ! Tu seras rappelé pour tes habitudes et examens.', icon: NOTIF_ICON })
    } else {
      setNotifEnabled(false)
      alert('Permission refusée. Active les notifications dans les paramètres de ton navigateur.')
    }
  }

  // Check au démarrage : examens & devoirs du jour / lendemain
  useEffect(() => {
    if (!notifEnabled || !notifSupported || Notification.permission !== 'granted') return
    const today = todayISO()
    const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowISO = tomorrow.toISOString().split('T')[0]

    examens.filter(e => e.date === today).forEach(e =>
      notify(`🎓 Examen AUJOURD'HUI`, `${e.matiere} à ${e.heure}${e.salle ? ` — ${e.salle}` : ''}`)
    )
    examens.filter(e => e.date === tomorrowISO).forEach(e =>
      notify(`🎓 Examen DEMAIN`, `${e.matiere} à ${e.heure} — Penses à réviser ce soir !`)
    )
    devoirs.filter(d => d.dateRendu === today && d.statut !== 'Rendu').forEach(d =>
      notify(`📋 Devoir à rendre AUJOURD'HUI`, `${d.matiere}${d.description ? ` — ${d.description}` : ''}`)
    )
    devoirs.filter(d => d.dateRendu === tomorrowISO && d.statut !== 'Rendu').forEach(d =>
      notify(`📋 Devoir à rendre DEMAIN`, `${d.matiere}`)
    )
  }, []) // eslint-disable-line

  // Vérification toutes les 60s pour les habitudes récurrentes
  const tasksRef = useRef(tasks)
  useEffect(() => { tasksRef.current = tasks }, [tasks])

  useEffect(() => {
    if (!notifEnabled) return
    const interval = setInterval(() => {
      if (!notifSupported || Notification.permission !== 'granted') return
      const now = new Date()
      const hhmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
      const JOURS = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
      const dayName = JOURS[now.getDay()]
      const todayStr = now.toISOString().split('T')[0]

      tasksRef.current.filter(t => {
        if (!t.recurring || !t.recurrenceTime || t.status === 'Terminé') return false
        if (t.recurrenceTime !== hhmm) return false
        if (t.recurrence === 'daily') return true
        if (t.recurrence === 'weekly') return (t.recurrenceDays || []).includes(dayName)
        if (t.recurrence === 'monthly') return t.deadline === todayStr
        return false
      }).forEach(t => {
        notify(`🔥 C'est l'heure — ${t.name}`, t.duration ? `Durée prévue : ${t.duration} min` : 'Ta routine t\'attend !')
      })
    }, 60000)
    return () => clearInterval(interval)
  }, [notifEnabled, notify, notifSupported])

  const exportData = () => {
    const data = {
      version: 1, exportedAt: new Date().toISOString(),
      profile, tasks, projects, expenses, subscriptions,
      objectif, adjustments, courses, devoirs, examens
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `personal-os-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const importData = (e) => {
    const file = e.target.files[0]
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
        setBackupModal(false)
        alert('✅ Données restaurées avec succès !')
      } catch { alert('Erreur : fichier JSON corrompu.') }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const shared = {
    tasks, setTasks, projects, setProjects, expenses, setExpenses,
    subscriptions, setSubscriptions, objectif, setObjectif,
    adjustments, setAdjustments, courses, setCourses,
    devoirs, setDevoirs, examens, setExamens,
    apiKey, setTab, profile, budgets, setBudgets,
    streakData, setStreakData,
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

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {profile && (
            <button className="btn-ghost" style={{ width: '100%', fontSize: 12, padding: '8px 12px', textAlign: 'left' }}
              onClick={() => setProfileModal(true)}>
              👤 {profile.prenom} {profile.nom || ''} <span style={{ color: 'var(--muted)', fontSize: 11 }}>— Modifier</span>
            </button>
          )}
          <button className="btn-ghost" style={{ width: '100%', fontSize: 12, padding: '8px 12px',
            color: notifEnabled ? '#4ade80' : undefined }}
            onClick={notifEnabled ? () => setNotifEnabled(false) : enableNotifications}>
            {notifEnabled ? '🔔 Notifications activées' : '🔕 Activer les notifications'}
          </button>
          <button className="btn-ghost" style={{ width: '100%', fontSize: 12, padding: '8px 12px' }}
            onClick={() => setBackupModal(true)}>
            💾 Sauvegarde / Restauration
          </button>
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
          {tab === 'ecole'       && <Ecole       courses={courses} setCourses={setCourses} devoirs={devoirs} setDevoirs={setDevoirs} examens={examens} setExamens={setExamens} tasks={tasks} setTasks={setTasks} />}
          {tab === 'finances'    && <Finances    expenses={expenses} setExpenses={setExpenses} subscriptions={subscriptions} setSubscriptions={setSubscriptions} budgets={budgets} setBudgets={setBudgets} />}
          {tab === 'stats'       && <Stats tasks={tasks} expenses={expenses} subscriptions={subscriptions} projects={projects} devoirs={devoirs} examens={examens} adjustments={adjustments} />}
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

      {/* SETUP PROFIL (premier lancement) */}
      {!profile && (
        <SetupModal onSave={setProfile} />
      )}

      {/* MODIFIER PROFIL */}
      {profileModal && (
        <ProfileModal profile={profile} onSave={p => { setProfile(p); setProfileModal(false) }} onClose={() => setProfileModal(false)} />
      )}

      {/* BACKUP / RESTORE */}
      {backupModal && (
        <div className="modal-overlay" onClick={() => setBackupModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 18, marginBottom: 8, color: '#F5C518' }}>💾 Sauvegarde & Restauration</h3>
            <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 20, lineHeight: 1.6 }}>
              Toutes tes données sont dans le navigateur. Exporte régulièrement pour ne rien perdre.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button className="btn-gold" onClick={exportData} style={{ textAlign: 'left', padding: '12px 16px' }}>
                ⬇️ Exporter mes données (JSON)
                <span style={{ display: 'block', fontSize: 11, fontWeight: 400, marginTop: 2, color: 'rgba(15,23,42,.7)' }}>
                  Tâches, projets, finances, école, profil
                </span>
              </button>
              <button className="btn-ghost" onClick={() => importRef.current?.click()} style={{ textAlign: 'left', padding: '12px 16px' }}>
                ⬆️ Restaurer depuis un fichier
                <span style={{ display: 'block', fontSize: 11, fontWeight: 400, marginTop: 2, color: 'var(--muted)' }}>
                  Remplace toutes les données actuelles
                </span>
              </button>
              <input ref={importRef} type="file" accept=".json" onChange={importData} style={{ display: 'none' }} />
            </div>
            <button className="btn-ghost" style={{ width: '100%', marginTop: 16 }} onClick={() => setBackupModal(false)}>Fermer</button>
          </div>
        </div>
      )}

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
