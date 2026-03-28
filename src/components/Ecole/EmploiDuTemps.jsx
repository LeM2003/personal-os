import { useState } from 'react'
import { genId, todayDay } from '../../utils/dates'
import { COURSE_PALETTE } from '../../utils/constants'

const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']

export default function EmploiDuTemps({ courses, setCourses }) {
  const blankForm = { nom: '', jour: 'Lundi', heureDebut: '08:00', heureFin: '10:00', salle: '', professeur: '', color: '#6366f1' }
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(blankForm)
  const dayNow = todayDay()

  const add = () => {
    if (!form.nom.trim()) return
    setCourses(p => [...p, { ...form, id: genId() }])
    setForm(blankForm); setShowForm(false)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 18 }}>
        <button className="btn-gold" onClick={() => setShowForm(s => !s)}>+ Ajouter un cours</button>
      </div>

      {showForm && (
        <div className="card" style={{ padding: 20, marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, marginBottom: 14 }}>Nouveau cours</h3>
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
              <input type="time" value={form.heureFin} onChange={e => setForm({ ...form, heureFin: e.target.value })} />
            </div>
            <input value={form.salle} onChange={e => setForm({ ...form, salle: e.target.value })} placeholder="Salle / Lieu" />
            <input value={form.professeur} onChange={e => setForm({ ...form, professeur: e.target.value })} placeholder="Professeur" />
            <div style={{ gridColumn: '1/-1', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 13, color: 'var(--muted)' }}>Couleur :</span>
              {COURSE_PALETTE.map(c => (
                <div key={c} onClick={() => setForm({ ...form, color: c })}
                  style={{ width: 22, height: 22, borderRadius: '50%', background: c, cursor: 'pointer',
                    border: `3px solid ${form.color === c ? '#fff' : 'transparent'}`, transition: 'border-color .15s' }} />
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            <button className="btn-gold" onClick={add}>Ajouter</button>
            <button className="btn-ghost" onClick={() => { setShowForm(false); setForm(blankForm) }}>Annuler</button>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 12, overflowX: 'auto' }} className="grid-6">
        {JOURS.map(jour => {
          const dayCourses = courses.filter(c => c.jour === jour).sort((a, b) => a.heureDebut.localeCompare(b.heureDebut))
          const isToday = jour === dayNow
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
                  ? <p style={{ color: '#2d3748', fontSize: 12, textAlign: 'center', padding: '12px 0' }}>—</p>
                  : dayCourses.map(c => (
                    <div key={c.id} style={{
                      background: `${c.color}18`, border: `1px solid ${c.color}35`,
                      borderLeft: `3px solid ${c.color}`, borderRadius: 8, padding: '8px 10px',
                    }}>
                      <p style={{ fontWeight: 600, fontSize: 12, color: c.color, margin: '0 0 2px',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.nom}</p>
                      <p style={{ fontSize: 11, color: 'var(--muted)', margin: 0 }}>{c.heureDebut}–{c.heureFin}</p>
                      {c.salle && <p style={{ fontSize: 10, color: 'var(--muted)', margin: '2px 0 0' }}>📍 {c.salle}</p>}
                      <button style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 10, marginTop: 4, padding: 0 }}
                        onClick={() => setCourses(p => p.filter(x => x.id !== c.id))}>✕ retirer</button>
                    </div>
                  ))
                }
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
