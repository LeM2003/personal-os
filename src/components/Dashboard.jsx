import { useEffect } from 'react'
import { todayISO, todayLabel, todayDay, greeting, fmtDate, daysUntil } from '../utils/dates'
import { PRIORITY_ORDER, PRIORITY_COLOR, CAT_COLORS } from '../utils/constants'
import { computeNextRenewal } from '../utils/subscriptions'
import StatCard from './shared/StatCard'
import EmptyState from './shared/EmptyState'

function isoMinusDays(n) {
  const d = new Date(); d.setDate(d.getDate() - n)
  return d.toISOString().split('T')[0]
}

export default function Dashboard({ tasks, objectif, setObjectif, expenses, subscriptions,
  devoirs, examens, adjustments, courses, setTab, profile, streakData, setStreakData }) {
  const now     = todayISO()
  const dayName = todayDay()

  const createdToday   = tasks.filter(t => t.createdAt === now)
  const completedToday = createdToday.filter(t => t.status === 'Terminé').length
  const todayExpTotal  = expenses.filter(e => e.date === now).reduce((s, e) => s + e.amount, 0)
  const nextExam       = [...examens].filter(e => daysUntil(e.date) >= 0).sort((a, b) => new Date(a.date) - new Date(b.date))[0]

  // Habitudes du jour
  const todayHabits = tasks.filter(t => {
    if (!t.recurring) return false
    if (t.recurrence === 'daily')   return true
    if (t.recurrence === 'weekly')  return (t.recurrenceDays || []).includes(dayName)
    if (t.recurrence === 'monthly') return t.deadline === now
    return false
  }).sort((a, b) => (a.recurrenceTime || '').localeCompare(b.recurrenceTime || ''))
  const habitsCompleted = todayHabits.filter(t => t.status === 'Terminé' && t.lastCompletedAt === now).length
  const habitsPct       = todayHabits.length > 0 ? Math.round((habitsCompleted / todayHabits.length) * 100) : 0

  const top3         = [...tasks].filter(t => t.status !== 'Terminé').sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]).slice(0, 3)
  const todayCourses = courses.filter(c => c.jour === dayName).sort((a, b) => a.heureDebut.localeCompare(b.heureDebut))
  const todayExpenses= expenses.filter(e => e.date === now).sort((a, b) => b.amount - a.amount)
  const upcomingSubs = subscriptions
    .map(s => ({ ...s, _next: s.nextRenewal || computeNextRenewal(s.startDate || now, s.cycle || 'Mensuel') }))
    .filter(s => { const d = daysUntil(s._next); return d >= 0 && d <= 30 })
    .sort((a, b) => new Date(a._next) - new Date(b._next))

  /* ── Météo de la journée ── */
  const tasksDueToday   = tasks.filter(t => t.deadline === now && t.status !== 'Terminé' && !t.recurring).length
  const devoirsUrgCount = devoirs.filter(d => { const j = daysUntil(d.dateRendu); return d.statut !== 'Rendu' && j >= 0 && j <= 1 }).length
  const chargeScore     = todayCourses.length + tasksDueToday + devoirsUrgCount * 2
  const meteo = chargeScore === 0
    ? { label: 'Calme',   icon: '🌙', color: '#9ca3af', sub: 'Profite pour avancer' }
    : chargeScore <= 2
    ? { label: 'Légère',  icon: '☀️', color: '#4ade80', sub: `${todayCourses.length + tasksDueToday} élément(s)` }
    : chargeScore <= 5
    ? { label: 'Normale', icon: '⛅', color: '#F5C518', sub: `${todayCourses.length + tasksDueToday} élément(s)` }
    : { label: 'Chargée', icon: '⛈️', color: '#f87171', sub: 'Organise-toi maintenant' }

  /* ── Score de la semaine (7 derniers jours) ── */
  const weekScore = (() => {
    let created = 0, done = 0
    for (let i = 0; i < 7; i++) {
      const date = isoMinusDays(i)
      tasks.forEach(t => {
        if (t.createdAt === date) { created++; if (t.status === 'Terminé') done++ }
      })
    }
    return created > 0 ? Math.round((done / created) * 100) : 0
  })()

  /* ── Streak : mise à jour au montage si jour productif ── */
  useEffect(() => {
    const today = todayISO()
    if (streakData?.lastDate === today) return
    const isActive = completedToday > 0 || habitsCompleted > 0
    if (!isActive) return
    const d = new Date(); d.setDate(d.getDate() - 1)
    const yesterday = d.toISOString().split('T')[0]
    const consecutive = streakData?.lastDate === yesterday
    setStreakData({ count: consecutive ? (streakData.count || 0) + 1 : 1, lastDate: today })
  }, [completedToday, habitsCompleted]) // eslint-disable-line

  const streak = streakData?.count || 0

  /* ── Alertes ── */
  const alerts = []
  examens.filter(e => { const d = daysUntil(e.date); return d >= 0 && d <= 7 })
    .forEach(e => {
      const d = daysUntil(e.date)
      const label = d === 0 ? "AUJOURD'HUI" : d === 1 ? 'DEMAIN' : `J-${d}`
      alerts.push({ type: 'red', msg: `🎓 Examen ${label} : ${e.matiere} — ${fmtDate(e.date)}` })
    })
  devoirs.filter(d => d.statut !== 'Rendu' && daysUntil(d.dateRendu) >= 0 && daysUntil(d.dateRendu) <= 2)
    .forEach(d => alerts.push({ type: 'red', msg: `📋 Devoir urgent J-${daysUntil(d.dateRendu)} : ${d.matiere}` }))
  upcomingSubs.filter(s => daysUntil(s._next) <= 7)
    .forEach(s => alerts.push({ type: 'yellow', msg: `💳 ${s.name} — paiement dans ${daysUntil(s._next)}j (${s.amount.toLocaleString('fr-FR')} FCFA)` }))
  devoirs.filter(d => d.statut !== 'Rendu' && daysUntil(d.dateRendu) < 0)
    .forEach(d => alerts.push({ type: 'red', msg: `⚠️ Devoir en retard : ${d.matiere}` }))
  if (adjustments.length > 0)
    alerts.push({ type: 'blue', msg: `🔄 ${adjustments.length} tâche${adjustments.length > 1 ? 's' : ''} en attente de reprogrammation` })

  return (
    <div>
      {/* ── En-tête ── */}
      <div style={{ marginBottom: 20 }}>
        <p style={{ color: 'var(--muted)', fontSize: 13, textTransform: 'capitalize', marginBottom: 6 }}>{todayLabel()}</p>
        <h1 style={{ fontSize: 30, fontWeight: 800, lineHeight: 1.2 }}>
          {greeting()}, <span style={{ color: '#F5C518' }}>{profile?.prenom || 'toi'}</span> 👋
        </h1>
      </div>

      {/* ── Bannière Météo / Streak / Score ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>

        <div className="card" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 30, lineHeight: 1 }}>{meteo.icon}</span>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: .7, margin: 0 }}>Journée</p>
            <p style={{ fontSize: 16, fontWeight: 700, color: meteo.color, margin: '2px 0 1px' }}>{meteo.label}</p>
            <p style={{ fontSize: 10, color: 'var(--muted)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{meteo.sub}</p>
          </div>
        </div>

        <div className="card" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 30, lineHeight: 1 }}>🔥</span>
          <div>
            <p style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: .7, margin: 0 }}>Streak</p>
            <p style={{ fontSize: 16, fontWeight: 700, color: streak >= 7 ? '#4ade80' : streak >= 3 ? '#f97316' : 'var(--text)', margin: '2px 0 1px' }}>
              {streak} jour{streak !== 1 ? 's' : ''}
            </p>
            <p style={{ fontSize: 10, color: 'var(--muted)', margin: 0 }}>
              {streak === 0 ? 'Commence aujourd\'hui' : streak >= 7 ? 'En feu 🔥' : 'Continue comme ça'}
            </p>
          </div>
        </div>

        <div className="card" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 30, lineHeight: 1 }}>📈</span>
          <div>
            <p style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: .7, margin: 0 }}>Score 7 jours</p>
            <p style={{ fontSize: 16, fontWeight: 700, margin: '2px 0 1px',
              color: weekScore >= 70 ? '#4ade80' : weekScore >= 40 ? '#F5C518' : '#f87171' }}>
              {weekScore}%
            </p>
            <p style={{ fontSize: 10, color: 'var(--muted)', margin: 0 }}>
              {weekScore >= 70 ? 'Excellente semaine' : weekScore >= 40 ? 'Peut mieux faire' : 'Reprends le rythme'}
            </p>
          </div>
        </div>

      </div>

      {/* ── Objectif ── */}
      <div className="card card-gold" style={{ padding: '16px 20px', marginBottom: 24 }}>
        <p style={{ color: '#F5C518', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
          🎯 Objectif principal du moment
        </p>
        <input value={objectif} onChange={e => setObjectif(e.target.value)}
          style={{ background: 'transparent', border: 'none', color: 'var(--text)', fontSize: 16,
            fontWeight: 500, fontFamily: 'Syne', padding: 0, boxShadow: 'none' }}
          placeholder="Définis ton objectif principal…" />
      </div>

      {/* ── KPI Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 14, marginBottom: 24 }}>
        <StatCard icon="✅" value={`${completedToday}/${createdToday.length || 0}`}       label="Tâches du jour"    color="#4ade80" />
        <StatCard icon="🔥" value={`${habitsCompleted}/${todayHabits.length}`}            label="Habitudes"         color="#f97316" onClick={() => setTab('taches')} />
        <StatCard icon="💸" value={`${todayExpTotal.toLocaleString('fr-FR')} F`}          label="Dépenses du jour"  color="#60a5fa" />
        <StatCard icon="🎓" value={nextExam ? `J-${daysUntil(nextExam.date)}` : '—'}      label="Prochain examen"   color="#F5C518" />
        <StatCard icon="🔄" value={adjustments.length}                                    label="Ajustements"       color="#f87171" onClick={() => setTab('ajustements')} />
      </div>

      {/* ── Habitudes du jour ── */}
      {todayHabits.length > 0 && (
        <div className="card" style={{ padding: 20, marginBottom: 24, border: '1px solid rgba(249,115,22,.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: .8 }}>
              🔥 Habitudes du jour
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: habitsPct === 100 ? '#4ade80' : '#f97316' }}>
                {habitsCompleted}/{todayHabits.length}
              </span>
              <button className="btn-ghost" style={{ fontSize: 11, padding: '4px 10px' }} onClick={() => setTab('taches')}>
                Gérer →
              </button>
            </div>
          </div>

          <div style={{ background: '#1f2937', borderRadius: 999, height: 6, marginBottom: 16, overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: 999,
              background: habitsPct === 100 ? '#4ade80' : 'linear-gradient(90deg, #f97316, #F5C518)',
              width: `${habitsPct}%`, transition: 'width .4s ease' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 8 }}>
            {todayHabits.map(t => {
              const done = t.status === 'Terminé' && t.lastCompletedAt === now
              return (
                <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                  background: done ? 'rgba(74,222,128,.07)' : '#0f172a',
                  border: `1px solid ${done ? 'rgba(74,222,128,.25)' : 'var(--border)'}`,
                  borderRadius: 8, opacity: done ? .75 : 1 }}>
                  <span style={{ fontSize: 18 }}>{done ? '✅' : '⭕'}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, margin: 0, fontWeight: 500,
                      textDecoration: done ? 'line-through' : 'none',
                      color: done ? 'var(--muted)' : 'var(--text)',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {t.name}
                    </p>
                    {t.recurrenceTime && (
                      <p style={{ fontSize: 11, color: '#f97316', margin: '2px 0 0' }}>🕐 {t.recurrenceTime}</p>
                    )}
                  </div>
                  {!done && <span style={{ fontSize: 11, color: 'var(--muted)', flexShrink: 0 }}>
                    {t.duration ? `${t.duration}min` : ''}
                  </span>}
                </div>
              )
            })}
          </div>

          {habitsPct === 100 && (
            <div style={{ marginTop: 14, textAlign: 'center', padding: '10px',
              background: 'rgba(74,222,128,.07)', border: '1px solid rgba(74,222,128,.2)', borderRadius: 8 }}>
              <span style={{ fontSize: 14, color: '#4ade80', fontWeight: 600 }}>
                🏆 Toutes tes habitudes sont faites aujourd'hui !
              </span>
            </div>
          )}
        </div>
      )}

      {/* ── Top 3 + Alertes ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }} className="grid-2">
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: .8 }}>⚡ Top 3 Priorités</h3>
            <button className="btn-ghost" style={{ fontSize: 11, padding: '4px 10px' }} onClick={() => setTab('taches')}>Voir tout →</button>
          </div>
          {top3.length === 0
            ? <EmptyState icon="🎉" msg="Aucune tâche active. Bien joué !" />
            : top3.map(t => (
              <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: '1px solid var(--border)' }}>
                <div className="p-dot" style={{ background: PRIORITY_COLOR[t.priority] }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.name}</p>
                  <p style={{ fontSize: 11, color: 'var(--muted)', margin: '2px 0 0' }}>
                    {t.project && `📁 ${t.project}`}{t.deadline && ` · ${fmtDate(t.deadline)}`}
                  </p>
                </div>
                <span className={`badge badge-${t.status === 'En cours' ? 'blue' : 'gray'}`}>{t.status}</span>
              </div>
            ))
          }
        </div>

        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: .8, marginBottom: 16 }}>⚠️ Alertes & Rappels</h3>
          {alerts.length === 0
            ? <EmptyState icon="✨" msg="Tout est sous contrôle !" sub="Aucune alerte pour le moment." />
            : <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {alerts.slice(0, 6).map((a, i) => (
                  <div key={i} className={`alert alert-${a.type}`}>{a.msg}</div>
                ))}
              </div>
          }
        </div>
      </div>

      {/* ── Résumé du jour ── */}
      <div style={{ marginBottom: 8 }}>
        <h2 style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1,
          color: 'var(--muted)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ display: 'inline-block', width: 3, height: 14, background: '#F5C518', borderRadius: 2 }} />
          Résumé du jour
        </h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20, marginBottom: 20 }} className="grid-3">

        {/* Agenda */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: .8 }}>📅 Agenda — {dayName}</h3>
            <button className="btn-ghost" style={{ fontSize: 11, padding: '4px 10px' }} onClick={() => setTab('ecole')}>École →</button>
          </div>
          {todayCourses.length === 0
            ? <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--muted)' }}>
                <div style={{ fontSize: 28, marginBottom: 6 }}>🎉</div>
                <p style={{ fontSize: 13 }}>Pas de cours aujourd'hui</p>
              </div>
            : <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {todayCourses.map(c => (
                  <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 10,
                    background: `${c.color}14`, borderLeft: `3px solid ${c.color}`, borderRadius: 7, padding: '9px 12px' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 600, color: c.color, margin: 0, fontSize: 13,
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.nom}</p>
                      <p style={{ fontSize: 11, color: 'var(--muted)', margin: '2px 0 0' }}>
                        {c.heureDebut} – {c.heureFin}{c.salle ? ` · ${c.salle}` : ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
          }
        </div>

        {/* Dépenses */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: .8 }}>💸 Dépenses du jour</h3>
            <button className="btn-ghost" style={{ fontSize: 11, padding: '4px 10px' }} onClick={() => setTab('finances')}>Finances →</button>
          </div>
          {todayExpenses.length === 0
            ? <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--muted)' }}>
                <div style={{ fontSize: 28, marginBottom: 6 }}>💰</div>
                <p style={{ fontSize: 13 }}>Aucune dépense ce jour</p>
              </div>
            : <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
                  {todayExpenses.slice(0, 5).map(e => (
                    <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: CAT_COLORS[e.category] || '#6b7280', flexShrink: 0 }} />
                      <span style={{ flex: 1, fontSize: 13, color: '#d1d5db', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {e.note || e.category}
                      </span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap' }}>
                        {e.amount.toLocaleString('fr-FR')} F
                      </span>
                    </div>
                  ))}
                  {todayExpenses.length > 5 && (
                    <p style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'center', margin: '4px 0 0' }}>
                      +{todayExpenses.length - 5} autre{todayExpenses.length - 5 > 1 ? 's' : ''}…
                    </p>
                  )}
                </div>
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: .5 }}>Total</span>
                  <span style={{ fontSize: 16, fontWeight: 700, color: '#F5C518' }}>{todayExpTotal.toLocaleString('fr-FR')} FCFA</span>
                </div>
              </>
          }
        </div>

        {/* Abonnements */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: .8 }}>💳 Prochains paiements</h3>
            <button className="btn-ghost" style={{ fontSize: 11, padding: '4px 10px' }} onClick={() => setTab('finances')}>Voir →</button>
          </div>
          {upcomingSubs.length === 0
            ? <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--muted)' }}>
                <div style={{ fontSize: 28, marginBottom: 6 }}>✅</div>
                <p style={{ fontSize: 13 }}>Aucun paiement dans 30 jours</p>
              </div>
            : <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {upcomingSubs.slice(0, 5).map(s => {
                  const due    = daysUntil(s._next)
                  const urgent = due <= 7
                  return (
                    <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px',
                      background: urgent ? 'rgba(239,68,68,.06)' : '#0f172a',
                      border: `1px solid ${urgent ? 'rgba(239,68,68,.2)' : 'var(--border)'}`, borderRadius: 8 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.name}</p>
                        <p style={{ fontSize: 11, color: urgent ? '#fca5a5' : 'var(--muted)', margin: '2px 0 0' }}>
                          {due === 0 ? "Aujourd'hui" : due === 1 ? 'Demain' : `Dans ${due}j`} — {fmtDate(s._next)}
                        </p>
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: urgent ? '#f87171' : '#F5C518', whiteSpace: 'nowrap' }}>
                        {s.amount.toLocaleString('fr-FR')} F
                      </span>
                    </div>
                  )
                })}
              </div>
          }
        </div>
      </div>
    </div>
  )
}
