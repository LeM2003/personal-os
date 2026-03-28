import { useState } from 'react'
import { genId, todayISO, fmtDate } from '../../utils/dates'
import { CAT_COLORS } from '../../utils/constants'
import StatCard from '../shared/StatCard'
import EmptyState from '../shared/EmptyState'

const CATS = ['Nourriture', 'Transport', 'Business', 'École', 'Loisirs', 'Autre']

export default function Depenses({ expenses, setExpenses }) {
  const blank = { amount: '', category: 'Nourriture', date: todayISO(), type: 'Variable', note: '' }
  const [form, setForm] = useState(blank)
  const [editingId, setEditingId] = useState(null)

  const openEdit = exp => {
    setEditingId(exp.id)
    setForm({ amount: String(exp.amount), category: exp.category, date: exp.date, type: exp.type, note: exp.note || '' })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const closeForm = () => { setEditingId(null); setForm({ ...blank, date: todayISO() }) }

  const add = () => {
    if (!form.amount) return
    if (editingId) {
      setExpenses(p => p.map(e => e.id === editingId ? { ...e, ...form, amount: +form.amount } : e))
      closeForm()
    } else {
      setExpenses(p => [...p, { ...form, amount: +form.amount, id: genId() }])
      setForm({ ...blank, date: todayISO() })
    }
  }

  const now = todayISO()
  const weekAgo = (() => { const d = new Date(); d.setDate(d.getDate() - 7); return d.toISOString().split('T')[0] })()
  const monthStart = (() => { const d = new Date(); d.setDate(1); return d.toISOString().split('T')[0] })()

  const todayTotal = expenses.filter(e => e.date === now).reduce((s, e) => s + e.amount, 0)
  const weekTotal  = expenses.filter(e => e.date >= weekAgo).reduce((s, e) => s + e.amount, 0)
  const monthTotal = expenses.filter(e => e.date >= monthStart).reduce((s, e) => s + e.amount, 0)

  const catTotals = {}
  CATS.forEach(c => { catTotals[c] = expenses.filter(e => e.date >= monthStart && e.category === c).reduce((s, x) => s + x.amount, 0) })
  const maxVal = Math.max(...Object.values(catTotals), 1)

  const sorted = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date))

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 24 }} className="grid-3">
        <StatCard icon="☀️" value={`${todayTotal.toLocaleString('fr-FR')} FCFA`} label="Aujourd'hui"      color="#F5C518" />
        <StatCard icon="📅" value={`${weekTotal.toLocaleString('fr-FR')} FCFA`}  label="7 derniers jours" color="#60a5fa" />
        <StatCard icon="📆" value={`${monthTotal.toLocaleString('fr-FR')} FCFA`} label="Ce mois"          color="#4ade80" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }} className="grid-2">
        {/* Bar chart */}
        <div className="card" style={{ padding: 20 }}>
          <p style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: .8, marginBottom: 16 }}>
            Dépenses par catégorie (ce mois)
          </p>
          {CATS.filter(c => catTotals[c] > 0).length === 0
            ? <EmptyState icon="📊" msg="Aucune dépense ce mois." />
            : CATS.map(cat => catTotals[cat] === 0 ? null : (
              <div key={cat} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 13, color: CAT_COLORS[cat], fontWeight: 500 }}>{cat}</span>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{catTotals[cat].toLocaleString('fr-FR')} FCFA</span>
                </div>
                <div style={{ background: '#1a2235', borderRadius: 999, height: 10, overflow: 'hidden' }}>
                  <div style={{
                    background: CAT_COLORS[cat], height: 10, borderRadius: 999,
                    width: `${(catTotals[cat] / maxVal) * 100}%`,
                    transition: 'width .5s ease', boxShadow: `0 0 8px ${CAT_COLORS[cat]}60`,
                  }} />
                </div>
              </div>
            ))
          }
        </div>

        {/* Add / Edit form */}
        <div className="card" style={{ padding: 20, border: editingId ? '1px solid rgba(245,197,24,.35)' : undefined }}>
          <p style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: .8, marginBottom: 16 }}>
            {editingId ? '✏️ Modifier la dépense' : 'Ajouter une dépense'}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })}
              placeholder="Montant en FCFA *" min={0} />
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
              {CATS.map(c => <option key={c}>{c}</option>)}
            </select>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                <option value="Variable">Variable</option>
                <option value="Fixe">Fixe</option>
              </select>
            </div>
            <input value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} placeholder="Note (optionnel)" />
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn-gold" onClick={add} style={{ flex: 1 }}>
                {editingId ? 'Enregistrer' : 'Ajouter la dépense'}
              </button>
              {editingId && <button className="btn-ghost" onClick={closeForm}>Annuler</button>}
            </div>
          </div>
        </div>
      </div>

      {/* History */}
      <div className="card" style={{ padding: 20 }}>
        <p style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: .8, marginBottom: 16 }}>
          Historique ({sorted.length} entrée{sorted.length !== 1 ? 's' : ''})
        </p>
        {sorted.length === 0 ? <EmptyState icon="🧾" msg="Aucune dépense enregistrée." /> : (
          sorted.slice(0, 30).map(e => (
            <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0',
              borderBottom: '1px solid var(--border)',
              background: editingId === e.id ? 'rgba(245,197,24,.04)' : undefined,
              borderRadius: editingId === e.id ? 6 : undefined }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: CAT_COLORS[e.category] || '#6b7280', flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 14 }}>{e.note || e.category}</p>
                <p style={{ margin: 0, fontSize: 11, color: 'var(--muted)' }}>{fmtDate(e.date)} · {e.category} · {e.type}</p>
              </div>
              <span style={{ fontWeight: 700, color: '#F5C518', whiteSpace: 'nowrap', fontSize: 14 }}>
                {e.amount.toLocaleString('fr-FR')} FCFA
              </span>
              <button className="btn-icon" title="Modifier" onClick={() => openEdit(e)}
                style={{ color: editingId === e.id ? '#F5C518' : undefined }}>✏️</button>
              <button className="btn-icon" onClick={() => setExpenses(p => p.filter(x => x.id !== e.id))}>✕</button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
