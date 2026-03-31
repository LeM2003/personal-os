import { useState, useEffect, useRef } from 'react'
import { genId, todayISO, fmtDate, daysUntil, nextOccurrenceDate } from '../utils/dates'
import { PRIORITY_ORDER, PRIORITY_COLOR, PRIORITY_EMOJI } from '../utils/constants'
import PageHeader from './shared/PageHeader'
import EmptyState from './shared/EmptyState'

const JOURS       = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']
const JOURS_SHORT = ['Lun',   'Mar',   'Mer',      'Jeu',   'Ven',      'Sam',    'Dim']
const NOTIF_ICON  = '/personal-os/icons/icon-192.png'

const blank = {
  name: '', project: '', priority: 'Important', duration: 25,
  deadline: '', flexible: false,
  recurring: false, recurrence: 'daily', recurrenceDays: [], recurrenceTime: ''
}

const fmt = (s) =>
  `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

/* ── Anneau SVG animé ── */
function TimerRing({ timeLeft, total, size = 200 }) {
  const r    = (size - 16) / 2
  const circ = 2 * Math.PI * r
  const pct  = total > 0 ? timeLeft / total : 0
  const dash = pct * circ
  const color = pct > 0.5 ? '#4ade80' : pct > 0.2 ? '#F5C518' : '#f87171'
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1a2235" strokeWidth={8} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={8}
        strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round"
        style={{ transition: 'stroke-dasharray .9s linear, stroke .5s ease' }} />
    </svg>
  )
}

/* ── Modal Pomodoro ── */
function PomodoroModal({ pomo, onPause, onStop, onDone }) {
  const { task, total, timeLeft, running, finished } = pomo
  const pct   = total > 0 ? timeLeft / total : 0
  const color = pct > 0.5 ? '#4ade80' : pct > 0.2 ? '#F5C518' : '#f87171'

  return (
    <div className="modal-overlay" style={{ zIndex: 9998 }}>
      <div className="modal-box" style={{ maxWidth: 360, textAlign: 'center', padding: '32px 28px' }}>

        {/* Titre tâche */}
        <p style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: .8, marginBottom: 6 }}>
          Session de travail
        </p>
        <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 24,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {task.name}
        </p>

        {/* Anneau + temps */}
        <div style={{ position: 'relative', display: 'inline-block', marginBottom: 24 }}>
          <TimerRing timeLeft={timeLeft} total={total} size={180} />
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center' }}>
            {finished ? (
              <span style={{ fontSize: 40 }}>🏆</span>
            ) : (
              <>
                <span style={{ fontSize: 36, fontWeight: 800, color, fontFamily: 'monospace', lineHeight: 1 }}>
                  {fmt(timeLeft)}
                </span>
                <span style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
                  {running ? 'en cours…' : 'en pause'}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Message fin */}
        {finished && (
          <div style={{ background: 'rgba(74,222,128,.08)', border: '1px solid rgba(74,222,128,.25)',
            borderRadius: 10, padding: '12px 16px', marginBottom: 20 }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#4ade80', margin: 0 }}>
              Temps écoulé ! Excellent travail.
            </p>
            <p style={{ fontSize: 12, color: 'var(--muted)', margin: '4px 0 0' }}>
              {task.duration} min sur « {task.name} »
            </p>
          </div>
        )}

        {/* Barre de progression */}
        {!finished && (
          <div style={{ background: '#1a2235', borderRadius: 999, height: 4, marginBottom: 24, overflow: 'hidden' }}>
            <div style={{ width: `${(1 - pct) * 100}%`, height: '100%', background: color,
              borderRadius: 999, transition: 'width .9s linear' }} />
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          {finished ? (
            <>
              <button className="btn-gold" onClick={onDone} style={{ flex: 1 }}>
                ✅ Marquer Terminé
              </button>
              <button className="btn-ghost" onClick={onStop} style={{ flex: 1 }}>
                Fermer
              </button>
            </>
          ) : (
            <>
              <button className="btn-gold" onClick={onPause} style={{ minWidth: 110 }}>
                {running ? '⏸ Pause' : '▶ Reprendre'}
              </button>
              <button className="btn-ghost" onClick={onDone} style={{ minWidth: 110 }}>
                ✅ Terminer
              </button>
              <button className="btn-ghost" onClick={onStop}
                style={{ minWidth: 80, color: '#f87171', borderColor: 'rgba(248,113,113,.3)' }}>
                ⏹ Arrêter
              </button>
            </>
          )}
        </div>

        {/* Info durée */}
        {!finished && (
          <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 14 }}>
            Durée prévue : {task.duration} min
            {task.project ? ` · 📁 ${task.project}` : ''}
          </p>
        )}
      </div>
    </div>
  )
}

export default function Taches({ tasks, setTasks, adjustments, setAdjustments }) {
  const [showForm,  setShowForm]  = useState(false)
  const [form,      setForm]      = useState(blank)
  const [editingId, setEditingId] = useState(null)
  const [fStatus,   setFStatus]   = useState('Tous')
  const [fPriority, setFPriority] = useState('Tous')
  const [pomo,      setPomo]      = useState(null)
  const bellRef = useRef(false)

  /* ── Tick du timer ── */
  useEffect(() => {
    if (!pomo || !pomo.running || pomo.timeLeft <= 0) return
    const t = setTimeout(() => {
      setPomo(prev => {
        if (!prev) return null
        if (prev.timeLeft <= 1) return { ...prev, timeLeft: 0, running: false, finished: true }
        return { ...prev, timeLeft: prev.timeLeft - 1 }
      })
    }, 1000)
    return () => clearTimeout(t)
  }, [pomo])

  /* ── Notification quand temps écoulé ── */
  useEffect(() => {
    if (!pomo?.finished || bellRef.current) return
    bellRef.current = true
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      new Notification('⏱ Temps écoulé !', {
        body: `${pomo.task.name} — ${pomo.task.duration} min de travail terminées !`,
        icon: NOTIF_ICON,
      })
    }
  }, [pomo?.finished]) // eslint-disable-line

  const startPomo = (task) => {
    bellRef.current = false
    const secs = (task.duration || 25) * 60
    setPomo({ task, total: secs, timeLeft: secs, running: true, finished: false })
    setTasks(prev => prev.map(t =>
      t.id === task.id && t.status === 'À faire' ? { ...t, status: 'En cours' } : t
    ))
  }

  const pausePomo  = () => setPomo(p => p ? { ...p, running: !p.running } : null)
  const stopPomo   = () => setPomo(null)
  const donePomo   = () => {
    if (pomo) {
      setTasks(prev => prev.map(t => {
        if (t.id !== pomo.task.id) return t
        if (t.recurring) return { ...t, status: 'Terminé', lastCompletedAt: todayISO() }
        return { ...t, status: 'Terminé' }
      }))
    }
    setPomo(null)
  }

  /* ── Formulaire ── */
  const openAdd  = () => { setEditingId(null); setForm(blank); setShowForm(true) }
  const openEdit = task => {
    setEditingId(task.id)
    setForm({
      name: task.name, project: task.project || '', priority: task.priority,
      duration: task.duration || 25, deadline: task.deadline || '', flexible: !!task.flexible,
      recurring: !!task.recurring, recurrence: task.recurrence || 'daily',
      recurrenceDays: task.recurrenceDays || [], recurrenceTime: task.recurrenceTime || ''
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
    const deadline = form.recurring && !form.deadline ? todayISO() : form.deadline
    if (editingId) {
      setTasks(p => p.map(t => t.id === editingId ? { ...t, ...form, deadline } : t))
    } else {
      setTasks(p => [...p, { ...form, deadline, id: genId(), status: 'À faire', createdAt: todayISO(), lastCompletedAt: null }])
    }
    closeForm()
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

  const filtered = tasks
    .filter(t => fStatus === 'Tous' || t.status === fStatus)
    .filter(t => fPriority === 'Tous' || t.priority === fPriority)

  const grouped = { Critique: [], Important: [], Optionnel: [] }
  filtered.forEach(t => (grouped[t.priority] ||= []).push(t))

  return (
    <div>
      <PageHeader title="✅ Tâches" action={<button className="btn-gold" onClick={openAdd}>+ Nouvelle tâche</button>} />

      {/* ── Formulaire ── */}
      {showForm && (
        <div className="card" style={{ padding: 20, marginBottom: 20, border: '1px solid rgba(245,197,24,.3)' }}>
          <h3 style={{ fontSize: 16, marginBottom: 16 }}>
            {editingId ? '✏️ Modifier la tâche' : 'Nouvelle tâche'}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }} className="grid-2">
            <div style={{ gridColumn: '1/-1' }}>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Nom de la tâche *" autoFocus />
            </div>
            <input value={form.project} onChange={e => setForm({ ...form, project: e.target.value })}
              placeholder="Projet lié (optionnel)" />
            <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
              <option value="Critique">🔴 Critique</option>
              <option value="Important">🟡 Important</option>
              <option value="Optionnel">⚪ Optionnel</option>
            </select>
            <input type="number" value={form.duration} min={5} step={5}
              onChange={e => setForm({ ...form, duration: +e.target.value })}
              placeholder="Durée estimée (min)" />
            <input type="date" value={form.deadline}
              onChange={e => setForm({ ...form, deadline: e.target.value })} />
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#9ca3af', fontSize: 14, cursor: 'pointer',
              background: '#0f172a', border: '1px solid #2d3748', borderRadius: 8, padding: '9px 12px' }}>
              <input type="checkbox" checked={form.flexible}
                onChange={e => setForm({ ...form, flexible: e.target.checked })}
                style={{ width: 'auto', accentColor: '#F5C518' }} />
              Tâche flexible
            </label>

            {/* Récurrence */}
            <div style={{ gridColumn: '1/-1' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#9ca3af', fontSize: 14, cursor: 'pointer',
                background: '#0f172a', border: '1px solid #2d3748', borderRadius: 8, padding: '9px 12px',
                marginBottom: form.recurring ? 10 : 0 }}>
                <input type="checkbox" checked={form.recurring}
                  onChange={e => setForm({ ...form, recurring: e.target.checked })}
                  style={{ width: 'auto', accentColor: '#F5C518' }} />
                ♻️ Tâche récurrente (se répète automatiquement)
              </label>

              {form.recurring && (
                <div style={{ background: 'rgba(245,197,24,.05)', border: '1px solid rgba(245,197,24,.2)', borderRadius: 8, padding: 14 }}>
                  <div style={{ marginBottom: 12 }}>
                    <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>Fréquence</p>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {[{ val: 'daily', label: 'Quotidien' }, { val: 'weekly', label: 'Hebdomadaire' }, { val: 'monthly', label: 'Mensuel' }]
                        .map(opt => (
                          <button key={opt.val} type="button" onClick={() => setForm({ ...form, recurrence: opt.val })}
                            style={{ padding: '6px 14px', borderRadius: 6, fontSize: 13, cursor: 'pointer', border: 'none',
                              background: form.recurrence === opt.val ? '#F5C518' : '#1f2937',
                              color: form.recurrence === opt.val ? '#0f172a' : '#9ca3af',
                              fontWeight: form.recurrence === opt.val ? 700 : 400 }}>
                            {opt.label}
                          </button>
                        ))}
                    </div>
                  </div>

                  {form.recurrence === 'weekly' && (
                    <div style={{ marginBottom: 12 }}>
                      <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>Jours de la semaine</p>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {JOURS.map((jour, i) => (
                          <button key={jour} type="button" onClick={() => toggleDay(jour)}
                            style={{ width: 40, height: 40, borderRadius: '50%', fontSize: 11, cursor: 'pointer', border: 'none',
                              background: form.recurrenceDays.includes(jour) ? '#F5C518' : '#1f2937',
                              color: form.recurrenceDays.includes(jour) ? '#0f172a' : '#9ca3af',
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
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
        {['Tous', 'À faire', 'En cours', 'Terminé'].map(s => (
          <button key={s} className={`filter-pill${fStatus === s ? ' active' : ''}`} onClick={() => setFStatus(s)}>{s}</button>
        ))}
        <div style={{ width: 1, background: 'var(--border)', margin: '0 4px' }} />
        {['Tous', 'Critique', 'Important', 'Optionnel'].map(p => (
          <button key={p} className={`filter-pill${fPriority === p ? ' active' : ''}`} onClick={() => setFPriority(p)}>
            {PRIORITY_EMOJI[p] || ''} {p}
          </button>
        ))}
      </div>

      {/* ── Liste des tâches ── */}
      {filtered.length === 0
        ? <EmptyState icon="📝" msg="Aucune tâche ici." sub="Cliquez sur « + Nouvelle tâche » pour commencer." />
        : Object.entries(grouped).map(([priority, list]) => list.length === 0 ? null : (
          <div key={priority} style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span>{PRIORITY_EMOJI[priority]}</span>
              <span style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 12, color: PRIORITY_COLOR[priority],
                textTransform: 'uppercase', letterSpacing: 1 }}>{priority}</span>
              <span style={{ background: '#1f2937', color: 'var(--muted)', borderRadius: '50%', width: 20, height: 20,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}>{list.length}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {list.map(t => (
                <TaskRow key={t.id} task={t}
                  cycleStatus={cycleStatus} del={del} toAdjust={toAdjust}
                  onEdit={openEdit} isEditing={editingId === t.id}
                  onPomo={startPomo}
                  isRunning={pomo?.task?.id === t.id && pomo.running} />
              ))}
            </div>
          </div>
        ))
      }

      {/* ── Modal Pomodoro ── */}
      {pomo && (
        <PomodoroModal pomo={pomo} onPause={pausePomo} onStop={stopPomo} onDone={donePomo} />
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
    const days = (task.recurrenceDays || []).map(d => short[d]).join(', ')
    return days ? `Chaque ${days}` : 'Hebdo'
  }
  return ''
}

function TaskRow({ task, cycleStatus, del, toAdjust, onEdit, isEditing, onPomo, isRunning }) {
  const due         = daysUntil(task.deadline)
  const overdue     = due < 0
  const urgent      = due >= 0 && due <= 2
  const canPomo     = task.status !== 'Terminé'
  const statusIcon  = { 'À faire': '⭕', 'En cours': '🔵', 'Terminé': '✅' }[task.status]
  const statusBg    = { 'À faire': '#1f2937', 'En cours': 'rgba(59,130,246,.15)', 'Terminé': 'rgba(34,197,94,.15)' }[task.status]
  const statusColor = { 'À faire': '#9ca3af', 'En cours': '#60a5fa', 'Terminé': '#4ade80' }[task.status]
  const nextDate    = task.recurring && task.status === 'Terminé' ? nextOccurrenceDate(task, task.lastCompletedAt) : null

  return (
    <div className={`task-card${task.status === 'Terminé' ? ' done' : ''}`}
      style={{
        borderLeft: `3px solid ${isEditing ? '#F5C518' : isRunning ? '#f97316' : task.status === 'Terminé' ? '#4ade80' : task.recurring ? 'rgba(245,197,24,.4)' : 'transparent'}`,
        background: isEditing ? 'rgba(245,197,24,.04)' : isRunning ? 'rgba(249,115,22,.04)' : undefined
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
        <div style={{ display: 'flex', gap: 10, marginTop: 3, flexWrap: 'wrap' }}>
          {task.project       && <span style={{ fontSize: 11, color: 'var(--muted)' }}>📁 {task.project}</span>}
          {task.duration      && <span style={{ fontSize: 11, color: 'var(--muted)' }}>⏱ {task.duration}min</span>}
          {task.recurrenceTime&& <span style={{ fontSize: 11, color: '#F5C518' }}>🕐 {task.recurrenceTime}</span>}
          {task.recurring     && <span style={{ fontSize: 11, color: 'rgba(245,197,24,.8)' }}>{recurringLabel(task)}</span>}
          {task.deadline && !task.recurring && (
            <span style={{ fontSize: 11, color: overdue ? '#f87171' : urgent ? '#F5C518' : 'var(--muted)' }}>
              {overdue ? '⚠️ Retard:' : '📅'} {fmtDate(task.deadline)}
            </span>
          )}
          {nextDate && <span style={{ fontSize: 11, color: '#4ade80' }}>🔄 Reprend le {fmtDate(nextDate)}</span>}
          {task.flexible && <span style={{ fontSize: 11, color: 'var(--muted)' }}>🔀 Flexible</span>}
          {isRunning && <span style={{ fontSize: 11, color: '#f97316', fontWeight: 600 }}>🍅 Timer en cours…</span>}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
        {/* ── Bouton Pomodoro ── */}
        {canPomo && (
          <button onClick={() => onPomo(task)} title="Démarrer un timer"
            style={{ background: isRunning ? 'rgba(249,115,22,.2)' : 'rgba(245,197,24,.1)',
              border: `1px solid ${isRunning ? 'rgba(249,115,22,.4)' : 'rgba(245,197,24,.3)'}`,
              borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontSize: 13,
              color: isRunning ? '#f97316' : '#F5C518', fontWeight: 600,
              transition: 'all .2s' }}>
            {isRunning ? '⏱' : '▶'}
          </button>
        )}

        <span style={{ background: statusBg, color: statusColor, padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600 }}>
          {task.status}
        </span>
        <button className="btn-icon" title="Modifier" onClick={() => onEdit(task)}
          style={{ color: isEditing ? '#F5C518' : undefined }}>✏️</button>
        {!task.recurring && (
          <button className="btn-icon" title="Déplacer en ajustements" onClick={() => toAdjust(task)}>🔄</button>
        )}
        <button className="btn-icon" title="Supprimer" onClick={() => del(task.id)}>✕</button>
      </div>
    </div>
  )
}
