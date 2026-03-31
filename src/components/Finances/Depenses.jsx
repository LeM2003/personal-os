import { useState } from 'react'
import { genId, todayISO, fmtDate } from '../../utils/dates'
import { CAT_COLORS } from '../../utils/constants'
import StatCard from '../shared/StatCard'
import EmptyState from '../shared/EmptyState'

const CATS = ['Nourriture', 'Transport', 'Business', 'École', 'Loisirs', 'Autre']

export default function Depenses({ expenses, setExpenses, budgets, setBudgets }) {
  const [editBudget, setEditBudget] = useState(false)
  const [budgetDraft, setBudgetDraft] = useState({})
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

  const totalBudget = CATS.reduce((s, c) => s + (budgets[c] || 0), 0)
  const totalDepenses = monthTotal
  const budgetRestant = totalBudget - totalDepenses
  const hasBudgets = CATS.some(c => budgets[c] > 0)

  const openBudgetEdit = () => {
    setBudgetDraft(Object.fromEntries(CATS.map(c => [c, budgets[c] || ''])))
    setEditBudget(true)
  }
  const saveBudgets = () => {
    const cleaned = Object.fromEntries(Object.entries(budgetDraft).map(([k, v]) => [k, v === '' ? 0 : +v]))
    setBudgets(cleaned)
    setEditBudget(false)
  }

  const budgetBarColor = (pct) => {
    if (pct >= 100) return '#f87171'
    if (pct >= 80)  return '#f97316'
    if (pct >= 60)  return '#F5C518'
    return '#4ade80'
  }

  const sorted = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date))

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 24 }} className="grid-3">
        <StatCard icon="☀️" value={`${todayTotal.toLocaleString('fr-FR')} FCFA`} label="Aujourd'hui"      color="#F5C518" />
        <StatCard icon="📅" value={`${weekTotal.toLocaleString('fr-FR')} FCFA`}  label="7 derniers jours" color="#60a5fa" />
        <StatCard icon="📆" value={`${monthTotal.toLocaleString('fr-FR')} FCFA`} label="Ce mois"          color="#4ade80" />
      </div>

      {/* Résumé budget global */}
      {hasBudgets && (
        <div className="card" style={{ padding: 20, marginBottom: 20,
          border: `1px solid ${budgetRestant < 0 ? 'rgba(248,113,113,.3)' : budgetRestant < totalBudget * 0.2 ? 'rgba(249,115,22,.3)' : 'rgba(74,222,128,.2)'}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <p style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: .8 }}>
              📊 Budget du mois
            </p>
            <span style={{ fontSize: 22, fontWeight: 800,
              color: budgetRestant < 0 ? '#f87171' : budgetRestant < totalBudget * 0.2 ? '#f97316' : '#4ade80' }}>
              {budgetRestant >= 0 ? `${budgetRestant.toLocaleString('fr-FR')} FCFA restants` : `⚠️ Dépassé de ${Math.abs(budgetRestant).toLocaleString('fr-FR')} FCFA`}
            </span>
          </div>
          <div style={{ background: '#1a2235', borderRadius: 999, height: 8, overflow: 'hidden', marginBottom: 8 }}>
            <div style={{
              height: '100%', borderRadius: 999, transition: 'width .5s ease',
              background: budgetBarColor(Math.round((totalDepenses / totalBudget) * 100)),
              width: `${Math.min((totalDepenses / totalBudget) * 100, 100)}%`
            }} />
          </div>
          <p style={{ fontSize: 12, color: 'var(--muted)' }}>
            {totalDepenses.toLocaleString('fr-FR')} / {totalBudget.toLocaleString('fr-FR')} FCFA dépensés
            ({Math.round((totalDepenses / totalBudget) * 100)}%)
          </p>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }} className="grid-2">
        {/* Bar chart avec budgets */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <p style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: .8 }}>
              Dépenses ce mois
            </p>
            {!editBudget
              ? <button className="btn-ghost" style={{ fontSize: 11, padding: '4px 10px' }} onClick={openBudgetEdit}>
                  ✏️ {hasBudgets ? 'Modifier budgets' : 'Définir des budgets'}
                </button>
              : <div style={{ display: 'flex', gap: 6 }}>
                  <button className="btn-gold" style={{ fontSize: 11, padding: '4px 10px' }} onClick={saveBudgets}>Enregistrer</button>
                  <button className="btn-ghost" style={{ fontSize: 11, padding: '4px 10px' }} onClick={() => setEditBudget(false)}>Annuler</button>
                </div>
            }
          </div>

          {editBudget ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>
                Fixe un budget mensuel par catégorie (0 = pas de limite)
              </p>
              {CATS.map(cat => (
                <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 13, color: CAT_COLORS[cat], fontWeight: 500, width: 90, flexShrink: 0 }}>{cat}</span>
                  <input type="number" min={0} step={500}
                    value={budgetDraft[cat] ?? ''}
                    onChange={e => setBudgetDraft({ ...budgetDraft, [cat]: e.target.value })}
                    placeholder="FCFA" style={{ flex: 1 }} />
                </div>
              ))}
            </div>
          ) : CATS.filter(c => catTotals[c] > 0 || budgets[c] > 0).length === 0 ? (
            <EmptyState icon="📊" msg="Aucune dépense ce mois." sub="Clique sur 'Définir des budgets' pour commencer." />
          ) : (
            CATS.map(cat => {
              const spent = catTotals[cat]
              const budget = budgets[cat] || 0
              if (spent === 0 && budget === 0) return null
              const pct = budget > 0 ? Math.round((spent / budget) * 100) : null
              const barColor = pct !== null ? budgetBarColor(pct) : CAT_COLORS[cat]
              const barWidth = budget > 0
                ? `${Math.min((spent / budget) * 100, 100)}%`
                : `${(spent / maxVal) * 100}%`
              return (
                <div key={cat} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, gap: 8 }}>
                    <span style={{ fontSize: 13, color: CAT_COLORS[cat], fontWeight: 500 }}>{cat}</span>
                    <span style={{ fontSize: 12, color: 'var(--muted)', textAlign: 'right' }}>
                      {spent.toLocaleString('fr-FR')}
                      {budget > 0 && ` / ${budget.toLocaleString('fr-FR')} FCFA`}
                      {pct !== null && <span style={{ marginLeft: 6, fontWeight: 700, color: barColor }}>{pct}%</span>}
                    </span>
                  </div>
                  <div style={{ background: '#1a2235', borderRadius: 999, height: 10, overflow: 'hidden' }}>
                    <div style={{
                      background: barColor, height: 10, borderRadius: 999,
                      width: barWidth, transition: 'width .5s ease',
                      boxShadow: `0 0 8px ${barColor}60`,
                    }} />
                  </div>
                  {pct !== null && pct >= 100 && (
                    <p style={{ fontSize: 11, color: '#f87171', marginTop: 3 }}>⚠️ Budget dépassé</p>
                  )}
                  {pct !== null && pct >= 80 && pct < 100 && (
                    <p style={{ fontSize: 11, color: '#f97316', marginTop: 3 }}>Attention — plus que {(budget - spent).toLocaleString('fr-FR')} FCFA</p>
                  )}
                </div>
              )
            })
          )}
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
