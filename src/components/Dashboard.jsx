import { useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { todayISO, todayLabel, todayDay, greeting, fmtDate, daysUntil } from '../utils/dates'
import { PRIORITY_ORDER, PRIORITY_COLOR, CAT_COLORS } from '../utils/constants'
import { computeNextRenewal } from '../utils/subscriptions'
import StatCard from './shared/StatCard'
import EmptyState from './shared/EmptyState'
import {
  CloudSun, Cloud, CloudLightning, Moon as MoonIcon,
  Flame, TrendingUp, Target, ClipboardList, CheckCircle2,
  Receipt, GraduationCap, BookOpen, Repeat, Zap, Calendar,
  CreditCard, MapPin, Clock
} from 'lucide-react'

function isoMinusDays(n) {
  const d = new Date(); d.setDate(d.getDate() - n)
  return d.toISOString().split('T')[0]
}

export default function Dashboard() {
  const { tasks, objectif, setObjectif, expenses, subscriptions,
    devoirs, examens, adjustments, courses, setTab, profile, streakData, setStreakData } = useApp()

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
    ? { label: 'Calme',   icon: <MoonIcon size={28} />, color: '#9ca3af', sub: 'Profite pour avancer' }
    : chargeScore <= 2
    ? { label: 'Légère',  icon: <CloudSun size={28} />, color: '#4ade80', sub: `${todayCourses.length + tasksDueToday} élément(s)` }
    : chargeScore <= 5
    ? { label: 'Normale', icon: <Cloud size={28} />, color: '#F5C518', sub: `${todayCourses.length + tasksDueToday} élément(s)` }
    : { label: 'Chargée', icon: <CloudLightning size={28} />, color: '#f87171', sub: 'Organise-toi maintenant' }

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
      alerts.push({ type: 'red', msg: `Examen ${label} : ${e.matiere} — ${fmtDate(e.date)}` })
    })
  devoirs.filter(d => d.statut !== 'Rendu' && daysUntil(d.dateRendu) >= 0 && daysUntil(d.dateRendu) <= 2)
    .forEach(d => alerts.push({ type: 'red', msg: `Devoir urgent J-${daysUntil(d.dateRendu)} : ${d.matiere}` }))
  upcomingSubs.filter(s => daysUntil(s._next) <= 7)
    .forEach(s => alerts.push({ type: 'yellow', msg: `${s.name} — paiement dans ${daysUntil(s._next)}j (${s.amount.toLocaleString('fr-FR')} FCFA)` }))
  devoirs.filter(d => d.statut !== 'Rendu' && daysUntil(d.dateRendu) < 0)
    .forEach(d => alerts.push({ type: 'red', msg: `Devoir en retard : ${d.matiere}` }))
  if (adjustments.length > 0)
    alerts.push({ type: 'blue', msg: `${adjustments.length} tâche${adjustments.length > 1 ? 's' : ''} en attente de reprogrammation` })

  return (
    <div>
      {/* ── En-tête ── */}
      <div style={{ marginBottom: 20 }}>
        <p style={{ color: 'var(--muted)', fontSize: 13, textTransform: 'capitalize', marginBottom: 6 }}>{todayLabel()}</p>
        <h1 style={{ fontSize: 30, fontWeight: 800, lineHeight: 1.2 }}>
          {greeting()}, <span style={{ color: '#F5C518' }}>{profile?.prenom || 'toi'}</span>
        </h1>
      </div>

      {/* ── Bannière Météo / Streak / Score ── */}
      <div className="grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
        <div className="card" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ color: meteo.color, lineHeight: 1 }}>{meteo.icon}</span>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: .7, margin: 0 }}>Journée</p>
            <p style={{ fontSize: 16, fontWeight: 700, color: meteo.color, margin: '2px 0 1px' }}>{meteo.label}</p>
            <p style={{ fontSize: 10, color: 'var(--muted)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{meteo.sub}</p>
          </div>
        </div>
        <div className="card" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <Flame size={28} style={{ color: streak >= 3 ? '#f97316' : 'var(--muted)' }} />
          <div>
            <p style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: .7, margin: 0 }}>Streak</p>
            <p style={{ fontSize: 16, fontWeight: 700, color: streak >= 7 ? '#4ade80' : streak >= 3 ? '#f97316' : 'var(--text)', margin: '2px 0 1px' }}>
              {streak} jour{streak !== 1 ? 's' : ''}
            </p>
            <p style={{ fontSize: 10, color: 'var(--muted)', margin: 0 }}>
              {streak === 0 ? 'Commence aujourd\'hui' : streak >= 7 ? 'En feu !' : 'Continue comme ça'}
            </p>
          </div>
        </div>
        <div className="card" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <TrendingUp size={28} style={{ color: weekScore >= 70 ? '#4ade80' : weekScore >= 40 ? '#F5C518' : '#f87171' }} />
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <p style={{ color: '#F5C518', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, margin: 0 }}>
            <Target size={12} style={{ display: 'inline', verticalAlign: -1, marginRight: 4 }} /> Objectif principal du moment
          </p>
          {objectif && <span style={{ fontSize: 10, color: '#4ade80', fontWeight: 500 }}>Sauvegardé automatiquement</span>}
        </div>
        <input value={objectif} onChange={e => setObjectif(e.target.value)}
          style={{ background: 'transparent', border: 'none', color: 'var(--text)', fontSize: 16,
            fontWeight: 500, fontFamily: 'Syne', padding: 0, boxShadow: 'none' }}
          placeholder="Ex: Valider mon semestre et lancer mon projet…" />
      </div>

      {/* ── KPI Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }} className="grid-3">
        <StatCard icon={<ClipboardList size={24} color="#F5C518" />} value={`${createdToday.length}`} label="Tâches du jour" color="#F5C518" />
        <StatCard icon={<CheckCircle2 size={24} color="#4ade80" />} value={`${completedToday}`} label="Terminées" color="#4ade80" />
        <StatCard icon={<Receipt size={24} color="#60a5fa" />} value={`${todayExpTotal.toLocaleString('fr-FR')} F`} label="Dépensé today" color="#60a5fa" />
        <StatCard icon={nextExam ? <GraduationCap size={24} color="#f87171" /> : <BookOpen size={24} color="#9ca3af" />}
          value={nextExam ? `J-${daysUntil(nextExam.date)}` : '—'}
          label={nextExam ? nextExam.matiere : 'Pas d\'examen'} color={nextExam ? '#f87171' : '#9ca3af'} />
      </div>

      {/* ── Alertes ── */}
      {alerts.length > 0 && (
        <div style={{ marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {alerts.map((a, i) => (
            <div key={i} className={`alert alert-${a.type}`}>{a.msg}</div>
          ))}
        </div>
      )}

      {/* ── Layout 2 col ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }} className="grid-2">
        {/* Habitudes */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <p style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: .8, margin: 0 }}>
              <Repeat size={13} style={{ display: 'inline', verticalAlign: -2, marginRight: 4 }} /> Habitudes du jour
            </p>
            <span style={{ fontSize: 14, fontWeight: 700,
              color: habitsPct >= 80 ? '#4ade80' : habitsPct >= 50 ? '#F5C518' : '#f87171' }}>
              {habitsPct}%
            </span>
          </div>
          {todayHabits.length === 0
            ? <EmptyState icon="😴" msg="Pas d'habitudes aujourd'hui." />
            : todayHabits.map(t => (
              <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0',
                borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: 14 }}>{t.status === 'Terminé' && t.lastCompletedAt === now ? '✅' : '⭕'}</span>
                <span style={{ flex: 1, fontSize: 13,
                  color: t.status === 'Terminé' && t.lastCompletedAt === now ? 'var(--muted)' : 'var(--text)',
                  textDecoration: t.status === 'Terminé' && t.lastCompletedAt === now ? 'line-through' : 'none' }}>
                  {t.name}
                </span>
                {t.recurrenceTime && <span style={{ fontSize: 11, color: '#F5C518', display: 'flex', alignItems: 'center', gap: 3 }}><Clock size={11} /> {t.recurrenceTime}</span>}
              </div>
            ))
          }
        </div>

        {/* Top 3 */}
        <div className="card" style={{ padding: 20 }}>
          <p style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: .8, marginBottom: 14 }}>
            <Zap size={13} style={{ display: 'inline', verticalAlign: -2, marginRight: 4 }} /> Top priorités
          </p>
          {top3.length === 0
            ? <EmptyState icon="🎉" msg="Toutes les tâches sont terminées !" />
            : top3.map((t, i) => (
              <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0',
                borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
                onClick={() => setTab('taches')}>
                <span style={{ color: '#F5C518', fontFamily: 'Syne', fontWeight: 700, fontSize: 14 }}>{i + 1}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.name}</p>
                  <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
                    <span style={{ fontSize: 10, color: PRIORITY_COLOR[t.priority] }}>{t.priority}</span>
                    {t.deadline && <span style={{ fontSize: 10, color: 'var(--muted)', display: 'inline-flex', alignItems: 'center', gap: 2 }}><Calendar size={10} /> {fmtDate(t.deadline)}</span>}
                  </div>
                </div>
              </div>
            ))
          }
        </div>
      </div>

      {/* ── Cours du jour + Dépenses ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }} className="grid-2">
        <div className="card" style={{ padding: 20 }}>
          <p style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: .8, marginBottom: 14 }}>
            <BookOpen size={13} style={{ display: 'inline', verticalAlign: -2, marginRight: 4 }} /> Cours aujourd'hui
          </p>
          {todayCourses.length === 0
            ? <EmptyState icon="🎉" msg="Pas de cours aujourd'hui !" />
            : todayCourses.map(c => (
              <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0',
                borderBottom: '1px solid var(--border)' }}>
                <div style={{ width: 4, height: 32, borderRadius: 2, background: c.color, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, margin: 0, color: c.color }}>{c.nom}</p>
                  <p style={{ fontSize: 11, color: 'var(--muted)', margin: '2px 0 0' }}>
                    {c.heureDebut}–{c.heureFin}{c.salle && <> · <MapPin size={10} style={{ display: 'inline', verticalAlign: -1 }} /> {c.salle}</>}
                  </p>
                </div>
              </div>
            ))
          }
        </div>

        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <p style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: .8, margin: 0 }}>
              <Receipt size={13} style={{ display: 'inline', verticalAlign: -2, marginRight: 4 }} /> Dépenses du jour
            </p>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#F5C518' }}>
              {todayExpTotal.toLocaleString('fr-FR')} F
            </span>
          </div>
          {todayExpenses.length === 0
            ? <EmptyState icon="💰" msg="Aucune dépense aujourd'hui." />
            : todayExpenses.slice(0, 5).map(e => (
              <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0',
                borderBottom: '1px solid var(--border)' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: CAT_COLORS[e.category] || '#6b7280' }} />
                <span style={{ flex: 1, fontSize: 13 }}>{e.note || e.category}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#F5C518' }}>
                  {e.amount.toLocaleString('fr-FR')} F
                </span>
              </div>
            ))
          }
        </div>
      </div>

      {/* ── Abonnements à venir ── */}
      {upcomingSubs.length > 0 && (
        <div className="card" style={{ padding: 20 }}>
          <p style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: .8, marginBottom: 14 }}>
            <CreditCard size={13} style={{ display: 'inline', verticalAlign: -2, marginRight: 4 }} /> Prochains paiements (30j)
          </p>
          {upcomingSubs.slice(0, 5).map(s => (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0',
              borderBottom: '1px solid var(--border)' }}>
              <Calendar size={16} style={{ color: 'var(--muted)', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 600, margin: 0 }}>{s.name}</p>
                <p style={{ fontSize: 11, color: 'var(--muted)', margin: '2px 0 0' }}>
                  {fmtDate(s._next)} — J-{daysUntil(s._next)}
                </p>
              </div>
              <span style={{ fontWeight: 700, color: '#F5C518', fontSize: 13 }}>
                {s.amount.toLocaleString('fr-FR')} F
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
