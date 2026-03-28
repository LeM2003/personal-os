import { useState } from 'react'
import { genId, todayISO, fmtDate } from '../utils/dates'
import PageHeader from './shared/PageHeader'
import EmptyState from './shared/EmptyState'

export default function Projets({ tasks, projects, setProjects, apiKey }) {
  const blank = { name: '', objective: '', targetDate: '' }
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(blank)
  const [analyzing, setAnalyzing] = useState(null)
  const [aiError, setAiError] = useState('')

  const addProject = () => {
    if (!form.name.trim()) return
    setProjects(p => [...p, { ...form, id: genId(), createdAt: todayISO(), aiAnalysis: null }])
    setForm(blank); setShowForm(false)
  }

  const del = id => setProjects(p => p.filter(x => x.id !== id))

  const progress = proj => {
    const linked = tasks.filter(t => t.project === proj.name)
    if (!linked.length) return 0
    return Math.round((linked.filter(t => t.status === 'Terminé').length / linked.length) * 100)
  }

  const analyzeProject = async proj => {
    if (!apiKey) {
      setAiError("⚠️ Veuillez d'abord configurer votre clé API (bouton « Clé API » en bas de la barre latérale).")
      return
    }
    setAnalyzing(proj.id); setAiError('')
    const linked = tasks.filter(t => t.project === proj.name)
    const prompt = [
      `Nom du projet : ${proj.name}`,
      `Objectif final : ${proj.objective || 'Non défini'}`,
      `Date cible : ${fmtDate(proj.targetDate)}`,
      `Tâches liées :`,
      linked.length
        ? linked.map(t => `  - ${t.name} (${t.status}, priorité: ${t.priority})`).join('\n')
        : '  Aucune tâche définie encore.',
    ].join('\n')

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 600,
          system: 'Tu es un coach business pour entrepreneurs africains. Analyse ce projet et donne une évaluation claire, pratique et motivante. Réponds en français. Réponds UNIQUEMENT en JSON valide, sans markdown ni backticks.',
          messages: [{
            role: 'user',
            content: prompt + '\n\nRéponds avec exactement ce format JSON :\n{"score_faisabilite": 8, "priorite_recommandee": "Haute", "prochaines_etapes": ["étape 1", "étape 2", "étape 3"], "raison": "Explication courte et motivante"}',
          }],
        }),
      })
      if (!res.ok) {
        const e = await res.json().catch(() => ({}))
        throw new Error(e.error?.message || `Erreur HTTP ${res.status}`)
      }
      const data = await res.json()
      let text = data.content?.[0]?.text || ''
      text = text.replace(/```json?|```/g, '').trim()
      const analysis = JSON.parse(text)
      setProjects(p => p.map(x => x.id === proj.id ? { ...x, aiAnalysis: analysis } : x))
    } catch (e) {
      setAiError(`Erreur lors de l'analyse IA : ${e.message}`)
    } finally {
      setAnalyzing(null)
    }
  }

  const sorted = [...projects].sort((a, b) => {
    const sa = a.aiAnalysis?.score_faisabilite ?? -1
    const sb = b.aiAnalysis?.score_faisabilite ?? -1
    return sb - sa
  })

  return (
    <div>
      <PageHeader title="🎯 Projets & Idées" action={<button className="btn-gold" onClick={() => setShowForm(s => !s)}>+ Nouveau projet</button>} />

      {aiError && (
        <div className="alert alert-red" style={{ marginBottom: 16 }}>
          {aiError}
          <button className="btn-icon" style={{ marginLeft: 'auto' }} onClick={() => setAiError('')}>✕</button>
        </div>
      )}

      {showForm && (
        <div className="card" style={{ padding: 20, marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, marginBottom: 16 }}>Nouveau projet / idée</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="Nom du projet *" autoFocus />
            <textarea rows={2} value={form.objective} onChange={e => setForm({ ...form, objective: e.target.value })}
              placeholder="Objectif final (ex : atteindre 10K abonnés)" />
            <input type="date" value={form.targetDate} onChange={e => setForm({ ...form, targetDate: e.target.value })} />
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <button className="btn-gold" onClick={addProject}>Créer</button>
            <button className="btn-ghost" onClick={() => { setShowForm(false); setForm(blank) }}>Annuler</button>
          </div>
        </div>
      )}

      {sorted.length === 0
        ? <EmptyState icon="🚀" msg="Aucun projet pour l'instant." sub="Créez votre premier projet et analysez-le avec l'IA !" />
        : sorted.map(proj => {
          const pct = progress(proj)
          const linked = tasks.filter(t => t.project === proj.name)
          const ai = proj.aiAnalysis
          const isAnalyzing = analyzing === proj.id
          const scoreColor = !ai ? null : ai.score_faisabilite >= 7 ? '#4ade80' : ai.score_faisabilite >= 4 ? '#F5C518' : '#f87171'

          return (
            <div key={proj.id} className="card" style={{ padding: 20, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
                    <h2 style={{ fontSize: 18, margin: 0 }}>{proj.name}</h2>
                    {ai && (
                      <span className="badge" style={{ background: `${scoreColor}22`, color: scoreColor, fontSize: 12 }}>
                        ★ {ai.score_faisabilite}/10
                      </span>
                    )}
                    {ai?.priorite_recommandee && <span className="badge badge-yellow">{ai.priorite_recommandee}</span>}
                  </div>
                  {proj.objective && <p style={{ color: '#9ca3af', fontSize: 13, margin: '0 0 4px' }}>{proj.objective}</p>}
                  {proj.targetDate && <p style={{ color: 'var(--muted)', fontSize: 12, margin: 0 }}>🗓 Cible : {fmtDate(proj.targetDate)}</p>}
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  <button className="btn-gold" style={{ fontSize: 12, padding: '7px 13px' }}
                    onClick={() => analyzeProject(proj)} disabled={isAnalyzing}>
                    {isAnalyzing ? <><span className="spinner" />Analyse…</> : '🤖 Analyser avec IA'}
                  </button>
                  <button className="btn-icon" onClick={() => del(proj.id)} title="Supprimer">✕</button>
                </div>
              </div>

              {/* Progress */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 12, color: 'var(--muted)' }}>
                    {linked.length} tâche{linked.length !== 1 ? 's' : ''} liée{linked.length !== 1 ? 's' : ''}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: pct === 100 ? '#4ade80' : '#F5C518' }}>{pct}%</span>
                </div>
                <div className="progress-track">
                  <div className={`progress-fill${pct === 100 ? ' green' : ''}`} style={{ width: `${pct}%` }} />
                </div>
              </div>

              {linked.length > 0 && (
                <div>
                  <p style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: .8, marginBottom: 8 }}>Tâches</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {linked.map(t => (
                      <span key={t.id} style={{
                        background: t.status === 'Terminé' ? 'rgba(34,197,94,.1)' : '#1a2235',
                        border: `1px solid ${t.status === 'Terminé' ? 'rgba(34,197,94,.3)' : '#2d3748'}`,
                        color: t.status === 'Terminé' ? '#4ade80' : '#9ca3af',
                        borderRadius: 6, padding: '3px 10px', fontSize: 12,
                      }}>
                        {t.status === 'Terminé' ? '✓ ' : ''}{t.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {ai && (
                <div className="ai-block">
                  <p style={{ color: '#F5C518', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 }}>
                    🤖 Analyse IA
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }} className="grid-2">
                    <div>
                      <p style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: .8, marginBottom: 5 }}>Score de faisabilité</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 28, color: scoreColor }}>{ai.score_faisabilite}</span>
                        <span style={{ color: 'var(--muted)', fontSize: 16 }}>/10</span>
                      </div>
                    </div>
                    <div>
                      <p style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: .8, marginBottom: 5 }}>Raison</p>
                      <p style={{ fontSize: 13, color: 'var(--text)', margin: 0, lineHeight: 1.5 }}>{ai.raison}</p>
                    </div>
                  </div>
                  {ai.prochaines_etapes?.length > 0 && (
                    <div>
                      <p style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: .8, marginBottom: 10 }}>Prochaines étapes</p>
                      {ai.prochaines_etapes.map((step, i) => (
                        <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 8, alignItems: 'flex-start' }}>
                          <span style={{ color: '#F5C518', fontFamily: 'Syne', fontWeight: 700, fontSize: 13, flexShrink: 0, marginTop: 1 }}>{i + 1}.</span>
                          <span style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.5 }}>{step}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })
      }
    </div>
  )
}
