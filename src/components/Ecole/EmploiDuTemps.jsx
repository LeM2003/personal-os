import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { genId, todayISO, todayDay } from '../../utils/dates'
import { COURSE_PALETTE } from '../../utils/constants'

const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']

const blankForm = { nom: '', jours: ['Lundi'], heureDebut: '08:00', heureFin: '10:00', salle: '', professeur: '', color: '#6366f1' }

export default function EmploiDuTemps() {
  const { courses, setCourses } = useApp()
  const [showForm,  setShowForm]  = useState(false)
  const [form,      setForm]      = useState(blankForm)
  const [editingId, setEditingId] = useState(null)
  const dayNow = todayDay()
  const today  = todayISO()

  const openAdd = () => { setEditingId(null); setForm(blankForm); setShowForm(true) }
  const openEdit = (c) => {
    setEditingId(c.id)
    setForm({ nom: c.nom, jours: [c.jour], heureDebut: c.heureDebut, heureFin: c.heureFin,
      salle: c.salle || '', professeur: c.professeur || '', color: c.color })
    setShowForm(true)
  }
  const closeForm = () => { setShowForm(false); setEditingId(null); setForm(blankForm) }

  const toggleJour = (jour) => {
    setForm(f => {
      const has = f.jours.includes(jour)
      const next = has ? f.jours.filter(j => j !== jour) : [...f.jours, jour]
      return { ...f, jours: next.length === 0 ? [jour] : next }
    })
  }

  const save = () => {
    if (!form.nom.trim()) return
    if (editingId) {
      // Edit: update existing course (single day)
      setCourses(p => p.map(c => c.id === editingId
        ? { ...c, nom: form.nom, jour: form.jours[0], heureDebut: form.heureDebut, heureFin: form.heureFin,
            salle: form.salle, professeur: form.professeur, color: form.color }
        : c))
    } else {
      // Add: create one course per selected day
      const newCourses = form.jours.map(jour => ({
        nom: form.nom, jour, heureDebut: form.heureDebut, heureFin: form.heureFin,
        salle: form.salle, professeur: form.professeur, color: form.color,
        id: genId(), attended: []
      }))
      setCourses(p => [...p, ...newCourses])
    }
    closeForm()
  }

  const del = (id) => {
    setCourses(p => p.filter(c => c.id !== id))
    closeForm()
  }

  const togglePresence = (id) => {
    setCourses(p => p.map(c => {
      if (c.id !== id) return c
      const attended = c.attended || []
      const already  = attended.includes(today)
      return { ...c, attended: already ? attended.filter(d => d !== today) : [...attended, today] }
    }))
  }

  const isPresent = (c) => (c.attended || []).includes(today)

  // Mobile: show today first, then other days
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640
  const sortedJours = isMobile
    ? [dayNow, ...JOURS.filter(j => j !== dayNow)]
    : JOURS

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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
            <input value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })}
              placeholder="Nom du cours *" autoFocus />

            {/* Sélection multi-jours */}
            <div>
              <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>
                {editingId ? 'Jour' : 'Jours (sélectionne un ou plusieurs)'}
              </p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {JOURS.map(j => (
                  <button key={j} type="button"
                    onClick={() => editingId ? setForm({ ...form, jours: [j] }) : toggleJour(j)}
                    style={{
                      padding: '7px 12px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                      border: form.jours.includes(j) ? '2px solid var(--gold)' : '1px solid var(--border)',
                      background: form.jours.includes(j) ? 'var(--gold-dim)' : 'transparent',
                      color: form.jours.includes(j) ? 'var(--gold)' : 'var(--muted)',
                      fontFamily: 'DM Sans',
                    }}>
                    {j.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div>
                <p style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>Début</p>
                <input type="time" value={form.heureDebut} onChange={e => setForm({ ...form, heureDebut: e.target.value })} />
              </div>
              <div>
                <p style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>Fin</p>
                <input type="time" value={form.heureFin} onChange={e => setForm({ ...form, heureFin: e.target.value })} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <input value={form.salle} onChange={e => setForm({ ...form, salle: e.target.value })} placeholder="Salle / Lieu" />
              <input value={form.professeur} onChange={e => setForm({ ...form, professeur: e.target.value })} placeholder="Professeur" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 13, color: 'var(--muted)' }}>Couleur :</span>
              {COURSE_PALETTE.map(c => (
                <div key={c} onClick={() => setForm({ ...form, color: c })}
                  style={{ width: 28, height: 28, borderRadius: '50%', background: c, cursor: 'pointer',
                    border: `3px solid ${form.color === c ? '#fff' : 'transparent'}`, transition: 'border-color .15s' }} />
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
            <button className="btn-gold" onClick={save}>
              {editingId ? 'Enregistrer' : `Ajouter${form.jours.length > 1 ? ` (${form.jours.length} jours)` : ''}`}
            </button>
            <button className="btn-ghost" onClick={closeForm}>Annuler</button>
            {editingId && (
              <button className="btn-danger" onClick={() => del(editingId)} style={{ marginLeft: 'auto' }}>
                🗑 Supprimer
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Grille hebdomadaire (desktop) / Liste (mobile) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 12 }} className="grid-6">
        {sortedJours.filter(j => JOURS.includes(j)).map(jour => {
          const dayCourses = courses.filter(c => c.jour === jour).sort((a, b) => a.heureDebut.localeCompare(b.heureDebut))
          const isToday = jour === dayNow
          return (
            <div key={jour}>
              <div className={`cal-day-header${isToday ? ' today' : ''}`}>
                <p style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 12,
                  color: isToday ? '#F5C518' : 'var(--muted)', margin: 0, textTransform: 'uppercase', letterSpacing: .6 }}>
                  {jour}
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
                          <p style={{ fontWeight: 600, fontSize: 13,
                            color: present ? '#4ade80' : c.color,
                            margin: '0 0 2px' }}>
                            {present ? '✓ ' : ''}{c.nom}
                          </p>
                          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0 }}>{c.heureDebut} – {c.heureFin}</p>
                          {c.salle && <p style={{ fontSize: 11, color: 'var(--muted)', margin: '2px 0 0' }}>📍 {c.salle}</p>}
                          {c.professeur && <p style={{ fontSize: 11, color: 'var(--muted)', margin: '2px 0 0' }}>👤 {c.professeur}</p>}
                          {attendCount > 0 && !isToday && (
                            <p style={{ fontSize: 10, color: 'rgba(74,222,128,.6)', margin: '3px 0 0' }}>
                              ✓ {attendCount} séance{attendCount > 1 ? 's' : ''}
                            </p>
                          )}

                          <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                            {isToday && (
                              <button onClick={() => togglePresence(c.id)} aria-label="Marquer présence"
                                style={{ fontSize: 11, padding: '5px 10px', borderRadius: 6, cursor: 'pointer', border: 'none',
                                  background: present ? 'rgba(74,222,128,.2)' : 'rgba(245,197,24,.15)',
                                  color: present ? '#4ade80' : '#F5C518', fontWeight: 600 }}>
                                {present ? '✓ Présent' : '+ Présence'}
                              </button>
                            )}
                            <button onClick={() => openEdit(c)} aria-label="Modifier le cours"
                              style={{ fontSize: 11, padding: '5px 10px', borderRadius: 6, cursor: 'pointer',
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
