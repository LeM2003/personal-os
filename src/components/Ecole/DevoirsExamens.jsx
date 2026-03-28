import { useState } from 'react'
import { genId, fmtDate, daysUntil } from '../../utils/dates'
import EmptyState from '../shared/EmptyState'

export default function DevoirsExamens({ devoirs, setDevoirs, examens, setExamens }) {
  const blankD = { matiere: '', description: '', dateRendu: '', statut: 'À faire', priorite: 'Important' }
  const blankE = { matiere: '', date: '', heure: '08:00', salle: '', chapitres: '', totalChapitres: 3, chapitresRevises: 0 }
  const [showDForm, setShowDForm] = useState(false)
  const [showEForm, setShowEForm] = useState(false)
  const [dForm, setDForm] = useState(blankD)
  const [eForm, setEForm] = useState(blankE)

  const addDevoir = () => {
    if (!dForm.matiere.trim()) return
    setDevoirs(p => [...p, { ...dForm, id: genId() }])
    setDForm(blankD); setShowDForm(false)
  }

  const addExamen = () => {
    if (!eForm.matiere.trim()) return
    setExamens(p => [...p, { ...eForm, id: genId(), totalChapitres: +eForm.totalChapitres, chapitresRevises: +eForm.chapitresRevises }])
    setEForm(blankE); setShowEForm(false)
  }

  const sortedDevoirs = [...devoirs].sort((a, b) => new Date(a.dateRendu) - new Date(b.dateRendu))
  const sortedExamens = [...examens].sort((a, b) => new Date(a.date) - new Date(b.date))

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }} className="grid-2">

      {/* Devoirs */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h3 style={{ fontSize: 16 }}>📋 Devoirs</h3>
          <button className="btn-gold" style={{ fontSize: 12, padding: '7px 13px' }} onClick={() => setShowDForm(s => !s)}>+ Ajouter</button>
        </div>

        {showDForm && (
          <div className="card" style={{ padding: 16, marginBottom: 14 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input value={dForm.matiere} onChange={e => setDForm({ ...dForm, matiere: e.target.value })} placeholder="Matière *" autoFocus />
              <input value={dForm.description} onChange={e => setDForm({ ...dForm, description: e.target.value })} placeholder="Description du devoir" />
              <input type="date" value={dForm.dateRendu} onChange={e => setDForm({ ...dForm, dateRendu: e.target.value })} />
              <select value={dForm.priorite} onChange={e => setDForm({ ...dForm, priorite: e.target.value })}>
                <option>Critique</option><option>Important</option><option>Optionnel</option>
              </select>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn-gold" style={{ fontSize: 13 }} onClick={addDevoir}>Ajouter</button>
                <button className="btn-ghost" style={{ fontSize: 13 }} onClick={() => { setShowDForm(false); setDForm(blankD) }}>Annuler</button>
              </div>
            </div>
          </div>
        )}

        {sortedDevoirs.length === 0
          ? <EmptyState icon="🎉" msg="Aucun devoir enregistré." sub="Profitez-en !" />
          : sortedDevoirs.map(d => {
            const due = daysUntil(d.dateRendu)
            return (
              <div key={d.id} className="card" style={{ padding: '12px 14px', marginBottom: 8,
                borderLeft: `3px solid ${due < 0 ? '#f87171' : due <= 2 ? '#f87171' : due <= 7 ? '#F5C518' : 'var(--border)'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap', marginBottom: 3 }}>
                      <span style={{ fontWeight: 600, fontSize: 14 }}>{d.matiere}</span>
                      {due < 0 && <span className="badge badge-red">En retard</span>}
                      {due >= 0 && due <= 2 && <span className="badge badge-red">J-{due}</span>}
                      {due > 2 && due <= 7 && <span className="badge badge-yellow">J-{due}</span>}
                    </div>
                    {d.description && <p style={{ fontSize: 13, color: '#9ca3af', margin: '0 0 3px' }}>{d.description}</p>}
                    {d.dateRendu && <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0 }}>📅 À rendre : {fmtDate(d.dateRendu)}</p>}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5, alignItems: 'flex-end', flexShrink: 0 }}>
                    <select value={d.statut} style={{ width: 'auto', fontSize: 12, padding: '4px 8px' }}
                      onChange={e => setDevoirs(p => p.map(x => x.id === d.id ? { ...x, statut: e.target.value } : x))}>
                      <option>À faire</option><option>En cours</option><option>Rendu</option>
                    </select>
                    <button className="btn-icon" style={{ fontSize: 12 }} onClick={() => setDevoirs(p => p.filter(x => x.id !== d.id))}>✕</button>
                  </div>
                </div>
              </div>
            )
          })
        }
      </div>

      {/* Examens */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h3 style={{ fontSize: 16 }}>🎓 Examens</h3>
          <button className="btn-gold" style={{ fontSize: 12, padding: '7px 13px' }} onClick={() => setShowEForm(s => !s)}>+ Ajouter</button>
        </div>

        {showEForm && (
          <div className="card" style={{ padding: 16, marginBottom: 14 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input value={eForm.matiere} onChange={e => setEForm({ ...eForm, matiere: e.target.value })} placeholder="Matière *" autoFocus />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <input type="date" value={eForm.date} onChange={e => setEForm({ ...eForm, date: e.target.value })} />
                <input type="time" value={eForm.heure} onChange={e => setEForm({ ...eForm, heure: e.target.value })} />
              </div>
              <input value={eForm.salle} onChange={e => setEForm({ ...eForm, salle: e.target.value })} placeholder="Salle" />
              <input value={eForm.chapitres} onChange={e => setEForm({ ...eForm, chapitres: e.target.value })}
                placeholder="Chapitres à réviser (ex: Tri, Graphes)" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <input type="number" min={1} value={eForm.totalChapitres}
                  onChange={e => setEForm({ ...eForm, totalChapitres: e.target.value })} placeholder="Total chapitres" />
                <input type="number" min={0} value={eForm.chapitresRevises}
                  onChange={e => setEForm({ ...eForm, chapitresRevises: e.target.value })} placeholder="Chapitres révisés" />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn-gold" style={{ fontSize: 13 }} onClick={addExamen}>Ajouter</button>
                <button className="btn-ghost" style={{ fontSize: 13 }} onClick={() => { setShowEForm(false); setEForm(blankE) }}>Annuler</button>
              </div>
            </div>
          </div>
        )}

        {sortedExamens.length === 0
          ? <EmptyState icon="📖" msg="Aucun examen planifié." sub="Bonne période !" />
          : sortedExamens.map(e => {
            const due = daysUntil(e.date)
            const total = +e.totalChapitres || 1
            const revus = Math.min(+e.chapitresRevises || 0, total)
            const pct = Math.round((revus / total) * 100)
            return (
              <div key={e.id} className="card" style={{ padding: '13px 14px', marginBottom: 8,
                borderLeft: `3px solid ${due >= 0 && due <= 7 ? '#F5C518' : due < 0 ? '#2d3748' : 'var(--border)'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 3 }}>
                      <span style={{ fontWeight: 600, fontSize: 14 }}>{e.matiere}</span>
                      {due >= 0 && due <= 7 && <span className="badge badge-yellow">J-{due}</span>}
                      {due >= 0 && due <= 2 && <span className="badge badge-red">URGENT</span>}
                      {due < 0 && <span className="badge badge-gray">Passé</span>}
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0 }}>
                      📅 {fmtDate(e.date)} à {e.heure}{e.salle && ` · 📍 ${e.salle}`}
                    </p>
                    {e.chapitres && <p style={{ fontSize: 12, color: '#9ca3af', margin: '3px 0 0' }}>📖 {e.chapitres}</p>}
                  </div>
                  <button className="btn-icon" onClick={() => setExamens(p => p.filter(x => x.id !== e.id))}>✕</button>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                    <span style={{ fontSize: 11, color: 'var(--muted)' }}>Révision</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <button className="btn-icon" style={{ width: 22, height: 22, background: '#1f2937', fontSize: 13, borderRadius: 5 }}
                        onClick={() => setExamens(p => p.map(x => x.id === e.id ? { ...x, chapitresRevises: Math.max(0, revus - 1) } : x))}>−</button>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#F5C518', minWidth: 40, textAlign: 'center' }}>{revus}/{total}</span>
                      <button className="btn-icon" style={{ width: 22, height: 22, background: '#1f2937', fontSize: 13, borderRadius: 5 }}
                        onClick={() => setExamens(p => p.map(x => x.id === e.id ? { ...x, chapitresRevises: Math.min(total, revus + 1) } : x))}>+</button>
                    </div>
                  </div>
                  <div className="progress-track">
                    <div className={`progress-fill${pct === 100 ? ' green' : ''}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </div>
            )
          })
        }
      </div>
    </div>
  )
}
