import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { genId, todayISO, todayDay } from '../../utils/dates'
import { COURSE_PALETTE } from '../../utils/constants'

const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']

const blank = { nom: '', jour: 'Lundi', heureDebut: '08:00', heureFin: '10:00', salle: '', professeur: '', color: '#6366f1' }

export default function EmploiDuTemps() {
  const { courses, setCourses } = useApp()
  const [showForm,  setShowForm]  = useState(false)
  const [form,      setForm]      = useState(blank)
  const [editingId, setEditingId] = useState(null)
  const dayNow = todayDay()
  const today  = todayISO()

  const openAdd = () => { setEditingId(null); setForm(blank); setShowForm(true) }
  const openEdit = (c) => {
    setEditingId(c.id)
    setForm({ nom: c.nom, jour: c.jour, heureDebut: c.heureDebut, heureFin: c.heureFin,
      salle: c.salle || '', professeur: c.professeur || '', color: c.color })
    setShowForm(true)
  }
  const closeForm = () => { setShowForm(false); setEditingId(null); setForm(blank) }

  const save = () => {
    if (!form.nom.trim()) return
    if (editingId) {
      setCourses(p => p.map(c => c.id === editingId ? { ...c, ...form } : c))
    } else {
      setCourses(p => [...p, { ...form, id: genId(), attended: [] }])
    }
    closeForm()
  }

  const del = (id) => {
    setCourses(p => p.filter(c => c.id !== id))
    closeForm()
  }

  /* ── Marquer présence ── */
  const togglePresence = (id) => {
    setCourses(p => p.map(c => {
      if (c.id !== id) return c
      const attended = c.attended || []
      const already  = attended.includes(today)
      return { ...c, attended: already ? attended.filter(d => d !== today) : [...attended, today] }
    }))
  }

  const isPresent = (c) => (c.attended || []).includes(today)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 18 }}>
        <button className="btn-gold" onClick={openAdd}>+ Ajouter un cours</button>
      </div>

      {/* ── Formulaire ajout / édition ── */}
      {showForm && (
        <div className="card" style={{ padding: 20, marginBottom: 20, border: '1px solid rgba(245,197,24,.25)' }}>
          <h3 style={{ fontSize: 15, marginBottom: 14 }}>
            {editingId ? '✏️ Modifier le cours' : 'Nouveau cours'}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 11 }} className="grid-2">
            <div style={{ gridColumn: '1/-1' }}>
              <input value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })}
                placeholder="Nom du cours *" autoFocus />
            </div>
            <select value={form.jour} onChange={e => setForm({ ...form, jour: e.target.value })}>
              {JOURS.map(j => <option key={j}>{j}</option>)}
            </select>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <input type="time" value={form.heureDebut} onChange={e => setForm({ ...form, heureDebut: e.target.value })} />
              <input type="time" value={form.heureFin}   onChange={e => setForm({ ...form, heureFin:   e.target.value })} />
            </div>
            <input value={form.salle}      onChange={e => setForm({ ...form, salle:      e.target.value })} placeholder="Salle / Lieu" />
            <input value={form.professeur} onChange={e => setForm({ ...form, professeur: e.target.value })} placeholder="Professeur" />
            <div style={{ gridColumn: '1/-1', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 13, color: 'var(--muted)' }}>Couleur :</span>
              {COURSE_PALETTE.map(c => (
                <div key={c} onClick={() => setForm({ ...form, color: c })}
                  style={{ width: 22, height: 22, borderRadius: '50%', background: c, cursor: 'pointer',
                    border: `3px solid ${form.color === c ? '#fff' : 'transparent'}`, transition: 'border-color .15s' }} />
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
            <button className="btn-gold" onClick={save}>{editingId ? 'Enregistrer' : 'Ajouter'}</button>
            <button className="btn-ghost" onClick={closeForm}>Annuler</button>
            {editingId && (
              <button className="btn-danger" onClick={() => del(editingId)}
                style={{ marginLeft: 'auto' }}>
                🗑 Supprimer
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Grille hebdomadaire ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 12, overflowX: 'auto' }} className="grid-6">
        {JOURS.map(jour => {
          const dayCourses = courses.filter(c => c.jour === jour).sort((a, b) => a.heureDebut.localeCompare(b.heureDebut))
          const isToday    = jour === dayNow
          return (
            <div key={jour}>
              <div className={`cal-day-header${isToday ? ' today' : ''}`}>
                <p style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 12,
                  color: isToday ? '#F5C518' : 'var(--muted)', margin: 0, textTransform: 'uppercase', letterSpacing: .6 }}>
                  {jour.slice(0, 3)}
                </p>
                {isToday && <p style={{ fontSize: 10, color: '#F5C518', margin: '2px 0 0' }}>Aujourd'hui</p>}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {dayCourses.length === 0
                  ? <p style={{ color: 'var(--input-border)', fontSize: 12, textAlign: 'center', padding: '12px 0' }}>—</p>
                  : dayCourses.map(c => {
                      const present = isPresent(c)
                      const attendCount = (c.attended || []).length
                      return (
                        <div key={c.id} style={{
                          background: present ? 'rgba(74,222,128,.08)' : `${c.color}18`,
                          border: `1px solid ${present ? 'rgba(74,222,128,.3)' : `${c.color}35`}`,
                          borderLeft: `3px solid ${present ? '#4ade80' : c.color}`,
                          borderRadius: 8, padding: '8px 10px',
                          transition: 'all .2s'
                        }}>
                          <p style={{ fontWeight: 600, fontSize: 12,
                            color: present ? '#4ade80' : c.color,
                            margin: '0 0 2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {present ? '✓ ' : ''}{c.nom}
                          </p>
                          <p style={{ fontSize: 11, color: 'var(--muted)', margin: 0 }}>{c.heureDebut}–{c.heureFin}</p>
                          {c.salle && <p style={{ fontSize: 10, color: 'var(--muted)', margin: '2px 0 0' }}>📍 {c.salle}</p>}
                          {attendCount > 0 && !isToday && (
                            <p style={{ fontSize: 10, color: 'rgba(74,222,128,.6)', margin: '3px 0 0' }}>
                              ✓ {attendCount} séance{attendCount > 1 ? 's' : ''}
                            </p>
                          )}

                          {/* Actions */}
                          <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                            {isToday && (
                              <button onClick={() => togglePresence(c.id)}
                                style={{ fontSize: 10, padding: '3px 8px', borderRadius: 5, cursor: 'pointer', border: 'none',
                                  background: present ? 'rgba(74,222,128,.2)' : 'rgba(245,197,24,.15)',
                                  color: present ? '#4ade80' : '#F5C518', fontWeight: 600 }}>
                                {present ? '✓ Présent' : '+ Présence'}
                              </button>
                            )}
                            <button onClick={() => openEdit(c)}
                              style={{ fontSize: 10, padding: '3px 8px', borderRadius: 5, cursor: 'pointer',
                                background: 'none', border: '1px solid var(--border)', color: 'var(--muted)' }}>
                              ✏️
                            </button>
                          </div>
                        </div>
                      )
                    })
                }
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
