import { useState } from 'react'
import { genId, todayISO, fmtDate, daysUntil, nextOccurrenceDate } from '../utils/dates'
import { PRIORITY_ORDER, PRIORITY_COLOR, PRIORITY_EMOJI } from '../utils/constants'
import PageHeader from './shared/PageHeader'
import EmptyState from './shared/EmptyState'

const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']
const JOURS_SHORT = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

const blank = {
  name: '', project: '', priority: 'Important', duration: 30,
  deadline: '', flexible: false,
  recurring: false, recurrence: 'daily', recurrenceDays: [], recurrenceTime: ''
}

export default function Taches({ tasks, setTasks, adjustments, setAdjustments }) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(blank)
  const [editingId, setEditingId] = useState(null)
  const [fStatus, setFStatus] = useState('Tous')
  const [fPriority, setFPriority] = useState('Tous')

  const openAdd = () => { setEditingId(null); setForm(blank); setShowForm(true) }
  const openEdit = task => {
    setEditingId(task.id)
    setForm({
      name: task.name, project: task.project || '', priority: task.priority,
      duration: task.duration || 30, deadline: task.deadline || '', flexible: !!task.flexible,
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
    if (next === 'Terminé' && t.recurring) {
      return { ...t, status: 'Terminé', lastCompletedAt: todayISO() }
    }
    return { ...t, status: next }
  }))

  const del = id => setTasks(p => p.filter(t => t.id !== id))

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
              onChange={e => setForm({ ...form, duration: +e.target.value })} placeholder="Durée estimée (min)" />
            <input type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} />
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#9ca3af', fontSize: 14, cursor: 'pointer',
              background: '#0f172a', border: '1px solid #2d3748', borderRadius: 8, padding: '9px 12px' }}>
              <input type="checkbox" checked={form.flexible} onChange={e => setForm({ ...form, flexible: e.target.checked })}
                style={{ width: 'auto', accentColor: '#F5C518' }} />
              Tâche flexible
            </label>

            {/* ── Récurrence ── */}
            <div style={{ gridColumn: '1/-1' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#9ca3af', fontSize: 14, cursor: 'pointer',
                background: '#0f172a', border: '1px solid #2d3748', borderRadius: 8, padding: '9px 12px', marginBottom: form.recurring ? 10 : 0 }}>
                <input type="checkbox" checked={form.recurring} onChange={e => setForm({ ...form, recurring: e.target.checked })}
                  style={{ width: 'auto', accentColor: '#F5C518' }} />
                ♻️ Tâche récurrente (se répète automatiquement)
              </label>

              {form.recurring && (
                <div style={{ background: 'rgba(245,197,24,.05)', border: '1px solid rgba(245,197,24,.2)', borderRadius: 8, padding: 14 }}>
                  {/* Fréquence */}
                  <div style={{ marginBottom: 12 }}>
                    <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>Fréquence</p>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {[
                        { val: 'daily', label: 'Quotidien' },
                        { val: 'weekly', label: 'Hebdomadaire' },
                        { val: 'monthly', label: 'Mensuel' },
                      ].map(opt => (
                        <button key={opt.val} type="button"
                          onClick={() => setForm({ ...form, recurrence: opt.val })}
                          style={{
                            padding: '6px 14px', borderRadius: 6, fontSize: 13, cursor: 'pointer', border: 'none',
                            background: form.recurrence === opt.val ? '#F5C518' : '#1f2937',
                            color: form.recurrence === opt.val ? '#0f172a' : '#9ca3af',
                            fontWeight: form.recurrence === opt.val ? 700 : 400,
                          }}>
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Jours (si hebdomadaire) */}
                  {form.recurrence === 'weekly' && (
                    <div style={{ marginBottom: 12 }}>
                      <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>Jours de la semaine</p>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {JOURS.map((jour, i) => (
                          <button key={jour} type="button"
                            onClick={() => toggleDay(jour)}
                            style={{
                              width: 40, height: 40, borderRadius: '50%', fontSize: 11, cursor: 'pointer', border: 'none',
                              background: form.recurrenceDays.includes(jour) ? '#F5C518' : '#1f2937',
                              color: form.recurrenceDays.includes(jour) ? '#0f172a' : '#9ca3af',
                              fontWeight: form.recurrenceDays.includes(jour) ? 700 : 400,
                            }}>
                            {JOURS_SHORT[i]}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Heure */}
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

      {/* Filters */}
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
              {list.map(t => <TaskRow key={t.id} task={t} cycleStatus={cycleStatus} del={del}
                toAdjust={toAdjust} onEdit={openEdit} isEditing={editingId === t.id} />)}
            </div>
          </div>
        ))
      }
    </div>
  )
}

function recurringLabel(task) {
  if (!task.recurring) return null
  if (task.recurrence === 'daily') return 'Quotidien'
  if (task.recurrence === 'monthly') return 'Mensuel'
  if (task.recurrence === 'weekly') {
    const short = { Lundi:'Lun', Mardi:'Mar', Mercredi:'Mer', Jeudi:'Jeu', Vendredi:'Ven', Samedi:'Sam', Dimanche:'Dim' }
    const days = (task.recurrenceDays || []).map(d => short[d]).join(', ')
    return days ? `Chaque ${days}` : 'Hebdo'
  }
  return ''
}

function TaskRow({ task, cycleStatus, del, toAdjust, onEdit, isEditing }) {
  const due = daysUntil(task.deadline)
  const overdue = due < 0
  const urgent = due >= 0 && due <= 2
  const statusIcon = { 'À faire': '⭕', 'En cours': '🔵', 'Terminé': '✅' }[task.status]
  const statusBg = { 'À faire': '#1f2937', 'En cours': 'rgba(59,130,246,.15)', 'Terminé': 'rgba(34,197,94,.15)' }[task.status]
  const statusColor = { 'À faire': '#9ca3af', 'En cours': '#60a5fa', 'Terminé': '#4ade80' }[task.status]
  const nextDate = task.recurring && task.status === 'Terminé' ? nextOccurrenceDate(task, task.lastCompletedAt) : null

  return (
    <div className={`task-card${task.status === 'Terminé' ? ' done' : ''}`}
      style={{ borderLeft: `3px solid ${isEditing ? '#F5C518' : task.status === 'Terminé' ? '#4ade80' : task.recurring ? 'rgba(245,197,24,.4)' : 'transparent'}`,
        background: isEditing ? 'rgba(245,197,24,.04)' : undefined }}>
      <button className="status-btn" onClick={() => cycleStatus(task.id)}
        style={{ background: statusBg, fontSize: 16 }} title="Changer statut">
        {statusIcon}
      </button>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 14, margin: 0, textDecoration: task.status === 'Terminé' ? 'line-through' : 'none',
          color: task.status === 'Terminé' ? 'var(--muted)' : 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {task.recurring && <span style={{ marginRight: 5 }}>♻️</span>}
          {task.name}
        </p>
        <div style={{ display: 'flex', gap: 10, marginTop: 3, flexWrap: 'wrap' }}>
          {task.project && <span style={{ fontSize: 11, color: 'var(--muted)' }}>📁 {task.project}</span>}
          {task.duration && <span style={{ fontSize: 11, color: 'var(--muted)' }}>⏱ {task.duration}min</span>}
          {task.recurrenceTime && <span style={{ fontSize: 11, color: '#F5C518' }}>🕐 {task.recurrenceTime}</span>}
          {task.recurring && <span style={{ fontSize: 11, color: 'rgba(245,197,24,.8)' }}>{recurringLabel(task)}</span>}
          {task.deadline && !task.recurring && (
            <span style={{ fontSize: 11, color: overdue ? '#f87171' : urgent ? '#F5C518' : 'var(--muted)' }}>
              {overdue ? '⚠️ Retard:' : '📅'} {fmtDate(task.deadline)}
            </span>
          )}
          {nextDate && (
            <span style={{ fontSize: 11, color: '#4ade80' }}>🔄 Reprend le {fmtDate(nextDate)}</span>
          )}
          {task.flexible && <span style={{ fontSize: 11, color: 'var(--muted)' }}>🔀 Flexible</span>}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
        <span style={{ background: statusBg, color: statusColor, padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600 }}>
          {task.status}
        </span>
        <button className="btn-icon" title="Modifier" onClick={() => onEdit(task)} style={{ color: isEditing ? '#F5C518' : undefined }}>✏️</button>
        {!task.recurring && (
          <button className="btn-icon" title="Déplacer en ajustements" onClick={() => toAdjust(task)}>🔄</button>
        )}
        <button className="btn-icon" title="Supprimer" onClick={() => del(task.id)}>✕</button>
      </div>
    </div>
  )
}
