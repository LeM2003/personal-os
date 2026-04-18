import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { genId, todayISO, todayDay, fmtDate, daysUntil, nextOccurrenceDate } from '../utils/dates'
import { PRIORITY_ORDER, PRIORITY_COLOR, PRIORITY_EMOJI } from '../utils/constants'
import PageHeader from './shared/PageHeader'
import EmptyState from './shared/EmptyState'
import TextImport from './shared/TextImport'

const JOURS       = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']
const JOURS_SHORT = ['Lun',   'Mar',   'Mer',      'Jeu',   'Ven',      'Sam',    'Dim']

const blank = {
  name: '', details: '', project: '', priority: 'Important',
  durationH: 0, durationM: 0,
  deadline: '', flexible: false,
  recurring: false, recurrence: 'daily', recurrenceDays: [], recurrenceTime: '',
  subtasks: [],
}

const formatDur = (mins) => {
  if (!mins || mins <= 0) return null
  const h = Math.floor(mins / 60), m = mins % 60
  if (h > 0 && m > 0) return `${h}h ${m}min`
  if (h > 0) return `${h}h`
  return `${m}min`
}

export default function Taches() {
  const { tasks, setTasks, adjustments, setAdjustments, pomo, startPomo, apiKey, devoirs, setDevoirs, examens, setExamens, projects } = useApp()
  const [showForm,  setShowForm]  = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [form,      setForm]      = useState(blank)
  const [editingId, setEditingId] = useState(null)
  const [fStatus,   setFStatus]   = useState('Tous')
  const [fPriority, setFPriority] = useState('Tous')
  const [fDate,     setFDate]     = useState("Aujourd'hui")
  const [fProject,  setFProject]  = useState('Tous')
  const [showDone,  setShowDone]  = useState(false)
  const [newSubtask, setNewSubtask] = useState('')
  const [showDetails, setShowDetails] = useState(false)
  const [expandedTaskId, setExpandedTaskId] = useState(null)
  const [snoozeForId, setSnoozeForId] = useState(null)

  const projectNames = projects ? [...new Set(projects.map(p => p.name).filter(Boolean))] : []

  const today = todayISO()
  const dayName = todayDay()
  const weekEnd = (() => { const d = new Date(); d.setDate(d.getDate() + 7); return d.toISOString().split('T')[0] })()
  const monthEnd = (() => { const d = new Date(); d.setMonth(d.getMonth() + 1, 0); return d.toISOString().split('T')[0] })()

  // Est-ce qu'une tâche récurrente est prévue pour aujourd'hui ?
  const recurringDueToday = (t) => {
    if (!t.recurring) return false
    if (t.recurrence === 'daily') return true
    if (t.recurrence === 'weekly') return (t.recurrenceDays || []).includes(dayName)
    if (t.recurrence === 'monthly') return t.deadline === today
    return false
  }

  const openAdd  = () => { setEditingId(null); setForm({ ...blank, deadline: todayISO() }); setShowDetails(false); setShowForm(true) }
  const openEdit = task => {
    setEditingId(task.id)
    setForm({
      name: task.name, details: task.details || '', project: task.project || '', priority: task.priority,
      durationH: Math.floor((task.duration || 0) / 60),
      durationM: (task.duration || 0) % 60,
      deadline: task.deadline || '', flexible: !!task.flexible,
      recurring: !!task.recurring, recurrence: task.recurrence || 'daily',
      recurrenceDays: task.recurrenceDays || [], recurrenceTime: task.recurrenceTime || '',
      subtasks: task.subtasks || [],
    })
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const closeForm = () => { setShowForm(false); setEditingId(null); setForm(blank) }

  const toggleDay = day => {
    const days = form.recurrenceDays.includes(day)
      ? form.recurrenceDays.filter(d => d !== day)
      : [...form.recurrenceDays, day]
    setForm({ ...form, recurrenceDays: days })
  }

  const saveTask = () => {
    if (!form.name.trim()) return
    const duration = form.durationH * 60 + form.durationM
    const deadline = form.recurring && !form.deadline ? todayISO() : form.deadline
    if (editingId) {
      setTasks(p => p.map(t => t.id === editingId ? { ...t, ...form, duration, deadline } : t))
    } else {
      setTasks(p => [...p, { ...form, duration, deadline, id: genId(), status: 'À faire', createdAt: todayISO(), lastCompletedAt: null }])
    }
    closeForm()
  }

  // Sous-taches dans le formulaire
  const addSubtaskToForm = (title) => {
    if (!title.trim()) return
    setForm(f => ({ ...f, subtasks: [...(f.subtasks || []), { id: genId(), title: title.trim(), done: false }] }))
  }
  const removeSubtaskFromForm = (sid) => {
    setForm(f => ({ ...f, subtasks: (f.subtasks || []).filter(s => s.id !== sid) }))
  }

  // Sous-taches sur une tache existante (toggle done)
  const toggleSubtask = (taskId, sid) => setTasks(p => p.map(t => {
    if (t.id !== taskId) return t
    return { ...t, subtasks: (t.subtasks || []).map(s => s.id === sid ? { ...s, done: !s.done } : s) }
  }))

  // Snooze : repousser la deadline de N jours a partir d'aujourd'hui
  const snoozeTask = (taskId, days) => {
    const d = new Date(); d.setDate(d.getDate() + days)
    const newDeadline = d.toISOString().split('T')[0]
    setTasks(p => p.map(t => t.id === taskId ? { ...t, deadline: newDeadline } : t))
  }

  const cycleStatus = id => setTasks(p => p.map(t => {
    if (t.id !== id) return t
    const next = { 'À faire': 'En cours', 'En cours': 'Terminé', 'Terminé': 'À faire' }[t.status]
    if (next === 'Terminé' && t.recurring) return { ...t, status: 'Terminé', lastCompletedAt: todayISO() }
    return { ...t, status: next }
  }))

  const del      = id => setTasks(p => p.filter(t => t.id !== id))
  const toAdjust = task => {
    setTasks(p => p.filter(t => t.id !== task.id))
    setAdjustments(p => [...p, {
      id: genId(), taskId: task.id, taskName: task.name,
      originalDeadline: task.deadline, reason: 'autre', newDate: '', originalTask: { ...task }
    }])
  }

  // Date filter helper
  const matchDate = (t) => {
    if (fDate === 'Tout') return true
    if (!t.deadline && !t.recurring) return fDate === 'Tout'
    const dl = t.deadline || ''
    if (fDate === "Aujourd'hui") {
      if (t.recurring) return recurringDueToday(t) && t.status !== 'Terminé'
      return dl === today
    }
    if (fDate === 'Semaine') return dl <= weekEnd || (t.recurring && t.status !== 'Terminé')
    if (fDate === 'Mois') return dl <= monthEnd || (t.recurring && t.status !== 'Terminé')
    return true
  }

  const filtered = tasks
    .filter(t => fStatus === 'Tous' || t.status === fStatus)
    .filter(t => fPriority === 'Tous' || t.priority === fPriority)
    .filter(t => fProject === 'Tous' || t.project === fProject)
    .filter(matchDate)

  // Separate done vs active
  const activeTasks = filtered.filter(t => t.status !== 'Terminé')
  const doneTasks = filtered.filter(t => t.status === 'Terminé')

  // Sort active by urgency: overdue first, then soonest deadline, then no deadline
  const sortByUrgency = (a, b) => {
    const da = a.deadline || '9999-99-99'
    const db = b.deadline || '9999-99-99'
    return da.localeCompare(db)
  }
  activeTasks.sort(sortByUrgency)

  const grouped = { Critique: [], Important: [], Optionnel: [] }
  activeTasks.forEach(t => (grouped[t.priority] ||= []).push(t))

  const doneGrouped = { Critique: [], Important: [], Optionnel: [] }
  doneTasks.forEach(t => (doneGrouped[t.priority] ||= []).push(t))

  // Counters
  const countCritique = activeTasks.filter(t => t.priority === 'Critique').length
  const countImportant = activeTasks.filter(t => t.priority === 'Important').length
  const countOptionnel = activeTasks.filter(t => t.priority === 'Optionnel').length

  const handleImport = ({ taches, devoirs: newDevoirs, examens: newExamens }) => {
    if (taches.length > 0) setTasks(p => [...p, ...taches])
    if (newDevoirs.length > 0 && setDevoirs) setDevoirs(p => [...p, ...newDevoirs])
    if (newExamens.length > 0 && setExamens) setExamens(p => [...p, ...newExamens])
  }

  return (
    <div>
      <PageHeader title="Tâches" action={
        <div style={{ display: 'flex', gap: 8 }}>
          {apiKey ? (
            <button className="btn-ghost" onClick={() => setShowImport(true)}
              style={{ fontSize: 13, padding: '8px 14px', border: '1px solid rgba(91,141,191,.3)' }}>
              Import IA
            </button>
          ) : (
            <button className="btn-ghost" onClick={() => alert('Configure ta clé API Gemini (gratuit) dans le menu Plus → Clé API pour utiliser l\'IA.')}
              style={{ fontSize: 13, padding: '8px 14px', opacity: .5 }}>
              Import IA
            </button>
          )}
          <button className="btn-gold" onClick={openAdd}>+ Nouvelle tâche</button>
        </div>
      } />

      {/* ── Formulaire ── */}
      {showForm && (
        <div className="card" style={{ padding: 20, marginBottom: 20, border: '1px solid rgba(91,141,191,.3)' }}>
          <h3 style={{ fontSize: 16, marginBottom: 16 }}>
            {editingId ? '✏️ Modifier la tâche' : 'Nouvelle tâche'}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }} className="grid-2">
            <div style={{ gridColumn: '1/-1' }}>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Nom de la tâche *" autoFocus />
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              {(showDetails || form.details) ? (
                <textarea value={form.details} onChange={e => setForm({ ...form, details: e.target.value })}
                  placeholder="Note (contexte, rappel, où, pourquoi...)"
                  rows={2} style={{ resize: 'vertical', minHeight: 44 }} autoFocus />
              ) : (
                <button type="button" className="btn-ghost"
                  onClick={() => setShowDetails(true)}
                  style={{ width: '100%', fontSize: 12, padding: '8px 12px', textAlign: 'left',
                    color: 'var(--muted)' }}>
                  + Ajouter une note
                </button>
              )}
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>☑ Sous-tâches (optionnel)</p>
              {(form.subtasks || []).length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 8 }}>
                  {form.subtasks.map(s => (
                    <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 8,
                      background: 'var(--surface-deep)', padding: '6px 10px', borderRadius: 6 }}>
                      <span style={{ flex: 1, fontSize: 13 }}>{s.title}</span>
                      <button type="button" className="btn-icon" onClick={() => removeSubtaskFromForm(s.id)} title="Retirer">✕</button>
                    </div>
                  ))}
                </div>
              )}
              <div style={{ display: 'flex', gap: 6 }}>
                <input value={newSubtask} onChange={e => setNewSubtask(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSubtaskToForm(newSubtask); setNewSubtask('') } }}
                  placeholder="Ajouter une sous-tâche puis Entrée" style={{ flex: 1 }} />
                <button type="button" className="btn-ghost"
                  onClick={() => { addSubtaskToForm(newSubtask); setNewSubtask('') }}
                  disabled={!newSubtask.trim()}>+ Ajouter</button>
              </div>
            </div>
            <select value={form.project} onChange={e => setForm({ ...form, project: e.target.value })}>
              <option value="">— Aucun projet —</option>
              {projectNames.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
              <option value="Critique">🔴 Critique</option>
              <option value="Important">🟡 Important</option>
              <option value="Optionnel">⚪ Optionnel</option>
            </select>

            {/* Durée heures + minutes */}
            <div style={{ gridColumn: '1/-1' }}>
              <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>⏱ Durée estimée</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="number" value={form.durationH} min={0} max={23} inputMode="numeric"
                  onChange={e => setForm({ ...form, durationH: Math.max(0, +e.target.value) })}
                  style={{ width: 72 }} />
                <span style={{ color: 'var(--muted)', fontSize: 14, whiteSpace: 'nowrap' }}>h</span>
                <input type="number" value={form.durationM} min={0} max={59} step={5} inputMode="numeric"
                  onChange={e => setForm({ ...form, durationM: Math.max(0, +e.target.value) })}
                  style={{ width: 72 }} />
                <span style={{ color: 'var(--muted)', fontSize: 14, whiteSpace: 'nowrap' }}>min</span>
                <span style={{ fontSize: 13, color: '#5B8DBF', marginLeft: 4 }}>
                  {formatDur(form.durationH * 60 + form.durationM) || '—'}
                </span>
              </div>
            </div>

            <input type="date" value={form.deadline}
              onChange={e => setForm({ ...form, deadline: e.target.value })} />
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--muted)', fontSize: 14, cursor: 'pointer',
              background: 'var(--surface-deep)', border: '1px solid var(--input-border)', borderRadius: 8, padding: '9px 12px' }}>
              <input type="checkbox" checked={form.flexible}
                onChange={e => setForm({ ...form, flexible: e.target.checked })}
                style={{ width: 'auto', accentColor: '#5B8DBF' }} />
              Tâche flexible
            </label>

            {/* Récurrence */}
            <div style={{ gridColumn: '1/-1' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--muted)', fontSize: 14, cursor: 'pointer',
                background: 'var(--surface-deep)', border: '1px solid var(--input-border)', borderRadius: 8, padding: '9px 12px',
                marginBottom: form.recurring ? 10 : 0 }}>
                <input type="checkbox" checked={form.recurring}
                  onChange={e => setForm({ ...form, recurring: e.target.checked })}
                  style={{ width: 'auto', accentColor: '#5B8DBF' }} />
                ♻️ Tâche récurrente (se répète automatiquement)
              </label>

              {form.recurring && (
                <div style={{ background: 'rgba(91,141,191,.05)', border: '1px solid rgba(91,141,191,.2)', borderRadius: 8, padding: 14 }}>
                  <div style={{ marginBottom: 12 }}>
                    <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>Fréquence</p>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {[{ val: 'daily', label: 'Quotidien' }, { val: 'weekly', label: 'Hebdomadaire' }, { val: 'monthly', label: 'Mensuel' }]
                        .map(opt => (
                          <button key={opt.val} type="button" onClick={() => setForm({ ...form, recurrence: opt.val })}
                            style={{ padding: '6px 14px', borderRadius: 6, fontSize: 13, cursor: 'pointer', border: 'none',
                              background: form.recurrence === opt.val ? '#5B8DBF' : 'var(--hover-bg)',
                              color: form.recurrence === opt.val ? 'var(--bg)' : 'var(--muted)',
                              fontWeight: form.recurrence === opt.val ? 700 : 400 }}>
                            {opt.label}
                          </button>
                        ))}
                    </div>
                  </div>

                  {form.recurrence === 'weekly' && (
                    <div style={{ marginBottom: 12 }}>
                      <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>Jours</p>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {JOURS.map((jour, i) => (
                          <button key={jour} type="button" onClick={() => toggleDay(jour)}
                            style={{ width: 38, height: 38, borderRadius: '50%', fontSize: 11, cursor: 'pointer', border: 'none',
                              background: form.recurrenceDays.includes(jour) ? '#5B8DBF' : 'var(--hover-bg)',
                              color: form.recurrenceDays.includes(jour) ? 'var(--bg)' : 'var(--muted)',
                              fontWeight: form.recurrenceDays.includes(jour) ? 700 : 400 }}>
                            {JOURS_SHORT[i]}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>Heure prévue (optionnel)</p>
                    <input type="time" value={form.recurrenceTime}
                      onChange={e => setForm({ ...form, recurrenceTime: e.target.value })}
                      style={{ width: 'auto' }} />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <button className="btn-gold" onClick={saveTask}>{editingId ? 'Enregistrer' : 'Ajouter'}</button>
            <button className="btn-ghost" onClick={closeForm}>Annuler</button>
          </div>
        </div>
      )}

      {/* ── Filtres ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
        {/* Ligne 1 : filtre date */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: .5 }}>Periode :</span>
          {["Aujourd'hui", 'Semaine', 'Mois', 'Tout'].map(d => (
            <button key={d} className={`filter-pill${fDate === d ? ' active' : ''}`} onClick={() => setFDate(d)}>{d}</button>
          ))}
        </div>
        {/* Ligne 2 : filtre statut + priorite */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {['Tous', 'À faire', 'En cours'].map(s => (
            <button key={s} className={`filter-pill${fStatus === s ? ' active' : ''}`} onClick={() => setFStatus(s)}>{s}</button>
          ))}
          <div style={{ width: 1, background: 'var(--border)', margin: '0 4px' }} />
          {['Tous', 'Critique', 'Important', 'Optionnel'].map(p => (
            <button key={p} className={`filter-pill${fPriority === p ? ' active' : ''}`} onClick={() => setFPriority(p)}>
              {PRIORITY_EMOJI[p] || ''} {p}
            </button>
          ))}
          {projectNames.length > 0 && (
            <>
              <div style={{ width: 1, background: 'var(--border)', margin: '0 4px' }} />
              <select value={fProject} onChange={e => setFProject(e.target.value)}
                style={{ padding: '5px 10px', fontSize: 12, borderRadius: 999, width: 'auto',
                  background: fProject !== 'Tous' ? 'var(--gold)' : 'var(--pill-bg)',
                  color: fProject !== 'Tous' ? '#0B1220' : 'var(--muted)',
                  border: 'none', fontWeight: fProject !== 'Tous' ? 700 : 500, cursor: 'pointer' }}>
                <option value="Tous">Tous les projets</option>
                {projectNames.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </>
          )}
        </div>
        {/* Resume compteurs */}
        <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--muted)' }}>
          <span>{activeTasks.length} active{activeTasks.length !== 1 ? 's' : ''}</span>
          {countCritique > 0 && <span style={{ color: '#f87171' }}>{countCritique} critique{countCritique > 1 ? 's' : ''}</span>}
          {countImportant > 0 && <span style={{ color: '#5B8DBF' }}>{countImportant} important{countImportant > 1 ? 'es' : 'e'}</span>}
          {countOptionnel > 0 && <span style={{ color: 'var(--muted)' }}>{countOptionnel} optionnel{countOptionnel > 1 ? 'les' : 'le'}</span>}
          {doneTasks.length > 0 && <span style={{ color: '#4ade80' }}>{doneTasks.length} terminee{doneTasks.length > 1 ? 's' : ''}</span>}
        </div>
      </div>

      {/* ── Liste active ── */}
      {activeTasks.length === 0 && doneTasks.length === 0
        ? <EmptyState icon="📝" msg="Rien à faire. Profite — ou ajoute quelque chose." sub="« + Nouvelle tâche » pour commencer." />
        : <>
          {activeTasks.length === 0 && !showDone
            ? <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--muted)', fontSize: 14 }}>
                Toutes les taches sont terminees pour cette periode !
              </div>
            : Object.entries(grouped).map(([priority, list]) => list.length === 0 ? null : (
              <div key={priority} style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <span>{PRIORITY_EMOJI[priority]}</span>
                  <span style={{ fontFamily: 'Fraunces', fontWeight: 700, fontSize: 12, color: PRIORITY_COLOR[priority],
                    textTransform: 'uppercase', letterSpacing: 1 }}>{priority}</span>
                  <span style={{ background: 'var(--hover-bg)', color: 'var(--muted)', borderRadius: '50%', width: 20, height: 20,
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}>{list.length}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {list.map(t => (
                    <TaskRow key={t.id} task={t}
                      cycleStatus={cycleStatus} del={del} toAdjust={toAdjust}
                      onEdit={openEdit} isEditing={editingId === t.id}
                      onPomo={startPomo}
                      isRunning={pomo?.task?.id === t.id}
                      expanded={expandedTaskId === t.id}
                      onToggleExpand={() => setExpandedTaskId(id => id === t.id ? null : t.id)}
                      onToggleSubtask={(sid) => toggleSubtask(t.id, sid)}
                      snoozeOpen={snoozeForId === t.id}
                      onOpenSnooze={() => setSnoozeForId(id => id === t.id ? null : t.id)}
                      onSnooze={(days) => { snoozeTask(t.id, days); setSnoozeForId(null) }} />
                  ))}
                </div>
              </div>
            ))
          }

          {/* ── Taches terminees (cachees par defaut) ── */}
          {doneTasks.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <button className="btn-ghost" onClick={() => setShowDone(s => !s)}
                style={{ width: '100%', fontSize: 13, padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                {showDone ? '▲ Masquer' : '▼ Voir'} les taches terminees ({doneTasks.length})
              </button>
              {showDone && (
                <div style={{ marginTop: 14, opacity: .75 }}>
                  {Object.entries(doneGrouped).map(([priority, list]) => list.length === 0 ? null : (
                    <div key={`done-${priority}`} style={{ marginBottom: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>✅ {priority} ({list.length})</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {list.map(t => (
                          <TaskRow key={t.id} task={t}
                            cycleStatus={cycleStatus} del={del} toAdjust={toAdjust}
                            onEdit={openEdit} isEditing={editingId === t.id}
                            onPomo={startPomo}
                            isRunning={pomo?.task?.id === t.id} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      }

      {showImport && (
        <TextImport apiKey={apiKey} onImport={handleImport} onClose={() => setShowImport(false)} />
      )}
    </div>
  )
}

function recurringLabel(task) {
  if (!task.recurring) return null
  if (task.recurrence === 'daily')   return 'Quotidien'
  if (task.recurrence === 'monthly') return 'Mensuel'
  if (task.recurrence === 'weekly') {
    const short = { Lundi:'Lun', Mardi:'Mar', Mercredi:'Mer', Jeudi:'Jeu', Vendredi:'Ven', Samedi:'Sam', Dimanche:'Dim' }
    const days  = (task.recurrenceDays || []).map(d => short[d]).join(', ')
    return days ? `Chaque ${days}` : 'Hebdo'
  }
  return ''
}

function TaskRow({ task, cycleStatus, del, toAdjust, onEdit, isEditing, onPomo, isRunning,
  expanded, onToggleExpand, onToggleSubtask,
  snoozeOpen, onOpenSnooze, onSnooze }) {
  const due         = daysUntil(task.deadline)
  const overdue     = due < 0
  const urgent      = due >= 0 && due <= 2
  const canPomo     = task.status !== 'Terminé'
  const statusIcon  = { 'À faire': '⭕', 'En cours': '🔵', 'Terminé': '✅' }[task.status]
  const statusBg    = { 'À faire': 'var(--status-idle-bg)', 'En cours': 'rgba(59,130,246,.15)', 'Terminé': 'rgba(34,197,94,.15)' }[task.status]
  const statusColor = { 'À faire': 'var(--muted)', 'En cours': '#60a5fa', 'Terminé': '#4ade80' }[task.status]
  const nextDate    = task.recurring && task.status === 'Terminé' ? nextOccurrenceDate(task, task.lastCompletedAt) : null
  const durLabel    = formatDur(task.duration)
  const subs        = task.subtasks || []
  const subsDone    = subs.filter(s => s.done).length
  const canSnooze   = !task.recurring && task.status !== 'Terminé'

  return (
    <div className={`task-card${task.status === 'Terminé' ? ' done' : ''}`}
      style={{
        borderLeft: `3px solid ${isEditing ? '#5B8DBF' : isRunning ? '#f97316' : task.status === 'Terminé' ? '#4ade80' : task.recurring ? 'rgba(91,141,191,.4)' : 'transparent'}`,
        background: isEditing ? 'rgba(91,141,191,.04)' : isRunning ? 'rgba(249,115,22,.04)' : undefined,
        flexWrap: 'wrap'
      }}>

      <button className="status-btn" onClick={() => cycleStatus(task.id)}
        style={{ background: statusBg, fontSize: 16 }} title="Changer statut">
        {statusIcon}
      </button>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 14, margin: 0, textDecoration: task.status === 'Terminé' ? 'line-through' : 'none',
          color: task.status === 'Terminé' ? 'var(--muted)' : 'var(--text)',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {task.recurring && <span style={{ marginRight: 5 }}>♻️</span>}
          {task.name}
        </p>
        {task.details && (
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: '3px 0 0', lineHeight: 1.5,
            whiteSpace: 'pre-line' }}>
            {task.details}
          </p>
        )}
        <div style={{ display: 'flex', gap: 10, marginTop: 3, flexWrap: 'wrap' }}>
          {task.project        && <span style={{ fontSize: 11, color: 'var(--muted)' }}>📁 {task.project}</span>}
          {durLabel            && <span style={{ fontSize: 11, color: 'var(--muted)' }}>⏱ {durLabel}</span>}
          {task.recurrenceTime && <span style={{ fontSize: 11, color: '#5B8DBF' }}>🕐 {task.recurrenceTime}</span>}
          {task.recurring      && <span style={{ fontSize: 11, color: 'rgba(91,141,191,.8)' }}>{recurringLabel(task)}</span>}
          {task.deadline && !task.recurring && (
            <span style={{ fontSize: 11, color: overdue ? '#f87171' : urgent ? '#5B8DBF' : 'var(--muted)' }}>
              {overdue ? '⚠️ Retard:' : '📅'} {fmtDate(task.deadline)}
            </span>
          )}
          {nextDate  && <span style={{ fontSize: 11, color: '#4ade80' }}>🔄 Reprend le {fmtDate(nextDate)}</span>}
          {task.flexible && <span style={{ fontSize: 11, color: 'var(--muted)' }}>🔀 Flexible</span>}
          {subs.length > 0 && (
            <button onClick={onToggleExpand} type="button"
              style={{ fontSize: 11, color: subsDone === subs.length ? '#4ade80' : '#5B8DBF',
                background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontWeight: 600 }}
              title={expanded ? 'Masquer' : 'Voir'}>
              ☑ {subsDone}/{subs.length} {expanded ? '▴' : '▾'}
            </button>
          )}
          {isRunning && <span style={{ fontSize: 11, color: '#f97316', fontWeight: 600 }}>🍅 Timer en cours…</span>}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
        {canPomo && (
          <button onClick={() => onPomo(task)} title="Démarrer un timer"
            style={{ background: isRunning ? 'rgba(249,115,22,.2)' : 'rgba(91,141,191,.1)',
              border: `1px solid ${isRunning ? 'rgba(249,115,22,.4)' : 'rgba(91,141,191,.3)'}`,
              borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontSize: 13,
              color: isRunning ? '#f97316' : '#5B8DBF', fontWeight: 600 }}>
            {isRunning ? '⏱' : '▶'}
          </button>
        )}
        <span style={{ background: statusBg, color: statusColor, padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600 }}>
          {task.status}
        </span>
        {canSnooze && (
          <div style={{ position: 'relative' }}>
            <button className="btn-icon" title="Repousser" onClick={onOpenSnooze}
              style={{ color: snoozeOpen ? '#5B8DBF' : undefined }}>💤</button>
            {snoozeOpen && (
              <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: 4, zIndex: 50,
                background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8,
                padding: 6, boxShadow: '0 4px 16px rgba(0,0,0,.25)', minWidth: 140,
                display: 'flex', flexDirection: 'column', gap: 2 }}>
                {[
                  { label: 'Demain', days: 1 },
                  { label: 'Dans 3 jours', days: 3 },
                  { label: 'Semaine prochaine', days: 7 },
                ].map(opt => (
                  <button key={opt.days} onClick={() => onSnooze(opt.days)} type="button"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px 10px',
                      borderRadius: 6, fontSize: 12, textAlign: 'left', color: 'var(--text)',
                      fontFamily: 'DM Sans' }}>
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        <button className="btn-icon" title="Modifier" onClick={() => onEdit(task)}
          style={{ color: isEditing ? '#5B8DBF' : undefined }}>✏️</button>
        {!task.recurring && (
          <button className="btn-icon" title="Déplacer en ajustements" onClick={() => toAdjust(task)}>🔄</button>
        )}
        <button className="btn-icon" title="Supprimer" onClick={() => del(task.id)}>✕</button>
      </div>

      {expanded && subs.length > 0 && (
        <div style={{ flexBasis: '100%', marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column', gap: 6 }}>
          {subs.map(s => (
            <label key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
              fontSize: 13, color: s.done ? 'var(--muted)' : 'var(--text)',
              textDecoration: s.done ? 'line-through' : 'none' }}>
              <input type="checkbox" checked={s.done} onChange={() => onToggleSubtask(s.id)}
                style={{ width: 'auto', accentColor: '#5B8DBF' }} />
              {s.title}
            </label>
          ))}
        </div>
      )}
    </div>
  )
}
