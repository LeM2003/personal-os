import { useState } from 'react'

const FEATURES = [
  { icon: '✅', title: 'Tâches intelligentes', desc: 'Priorités, deadlines, filtres, timer Pomodoro intégré. Ne rate plus rien.' },
  { icon: '💰', title: 'Budget en FCFA', desc: 'Suis tes dépenses par catégorie, fixe des budgets, visualise où va ton argent.' },
  { icon: '📚', title: 'Suivi scolaire', desc: 'Emploi du temps, devoirs, examens, révisions — tout au même endroit.' },
  { icon: '🎯', title: 'Projets & Idées', desc: 'Transforme tes idées en projets avec étapes, notes et suivi de progression.' },
  { icon: '📊', title: 'Score de productivité', desc: 'Vois ta performance sur 7 jours, tes habitudes, ta discipline — en un coup d\'œil.' },
  { icon: '🤖', title: 'IA intégrée', desc: 'Analyse tes projets et importe tes tâches par texte grâce à l\'IA (gratuit).' },
]

const STATS = [
  { value: '100%', label: 'Gratuit' },
  { value: '0', label: 'Téléchargement' },
  { value: '30s', label: 'Pour commencer' },
  { value: '∞', label: 'Hors ligne' },
]

const TESTIMONIALS = [
  { text: "J'ai enfin un endroit où je vois mes cours, mes dépenses et mes projets sans jongler entre 5 apps.", author: 'Étudiant, UCAD' },
  { text: "Le suivi budget en FCFA c'est ce qui manquait. Je sais enfin où passe mon argent chaque mois.", author: 'Entrepreneur, Dakar' },
]

export default function LandingPage({ onStart }) {
  const [form, setForm] = useState({ prenom: '', nom: '', role: 'Étudiant-entrepreneur' })
  const [showSetup, setShowSetup] = useState(false)

  const save = () => { if (!form.prenom.trim()) return; onStart(form) }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', overflowX: 'hidden' }}>

      {/* ── HERO ── */}
      <header style={{ padding: '60px 20px 40px', textAlign: 'center', maxWidth: 700, margin: '0 auto' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--gold-dim)',
          border: '1px solid rgba(245,197,24,.2)', borderRadius: 999, padding: '6px 16px', marginBottom: 24 }}>
          <span style={{ fontSize: 12, color: 'var(--gold)', fontWeight: 600 }}>100% gratuit — aucun compte requis</span>
        </div>

        <h1 style={{ fontFamily: 'Syne', fontSize: 'clamp(28px, 6vw, 48px)', fontWeight: 800,
          lineHeight: 1.15, marginBottom: 16 }}>
          Ta vie d'étudiant-entrepreneur,{' '}
          <span style={{ color: '#F5C518' }}>un seul dashboard</span>
        </h1>

        <p style={{ fontSize: 'clamp(15px, 3vw, 18px)', color: 'var(--muted)', lineHeight: 1.7,
          maxWidth: 520, margin: '0 auto 32px' }}>
          Tâches, budget en FCFA, emploi du temps, projets, stats — tout ce dont tu as besoin
          pour prendre ta vie en main. Sans inscription. Sans téléchargement.
        </p>

        <button onClick={() => setShowSetup(true)}
          style={{ background: 'linear-gradient(135deg, #F5C518 0%, #d4a500 100%)', color: '#0A0E1A',
            border: 'none', borderRadius: 12, padding: '16px 40px', fontSize: 17, fontWeight: 800,
            fontFamily: 'Syne', cursor: 'pointer', transition: 'transform .15s, filter .2s',
            boxShadow: '0 4px 20px rgba(245,197,24,.3)' }}
          onMouseOver={e => e.target.style.transform = 'translateY(-2px)'}
          onMouseOut={e => e.target.style.transform = 'translateY(0)'}>
          Commencer gratuitement →
        </button>

        <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 12 }}>
          Tes données restent dans ton navigateur. Rien n'est envoyé.
        </p>
      </header>

      {/* ── STATS BAR ── */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 'clamp(16px, 4vw, 40px)',
        padding: '24px 20px', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)',
        maxWidth: 600, margin: '0 auto' }}>
        {STATS.map(s => (
          <div key={s.label} style={{ textAlign: 'center' }}>
            <p style={{ fontFamily: 'Syne', fontSize: 'clamp(20px, 4vw, 28px)', fontWeight: 800, color: '#F5C518', margin: 0 }}>
              {s.value}
            </p>
            <p style={{ fontSize: 11, color: 'var(--muted)', margin: '2px 0 0', textTransform: 'uppercase',
              letterSpacing: .5 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── FEATURES ── */}
      <section style={{ padding: '48px 20px', maxWidth: 900, margin: '0 auto' }}>
        <h2 style={{ fontFamily: 'Syne', fontSize: 'clamp(20px, 4vw, 28px)', fontWeight: 800,
          textAlign: 'center', marginBottom: 8 }}>
          Tout ce qu'il te faut. <span style={{ color: '#F5C518' }}>Rien de plus.</span>
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 14, marginBottom: 36, maxWidth: 500, margin: '0 auto 36px' }}>
          Pas besoin de 10 apps différentes. Personal OS combine tout dans une interface simple et rapide.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
          {FEATURES.map(f => (
            <div key={f.title} style={{ background: 'var(--card)', border: '1px solid var(--border)',
              borderRadius: 14, padding: '20px 18px', transition: 'border-color .2s' }}
              onMouseOver={e => e.currentTarget.style.borderColor = 'rgba(245,197,24,.3)'}
              onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border)'}>
              <span style={{ fontSize: 28, display: 'block', marginBottom: 10 }}>{f.icon}</span>
              <h3 style={{ fontFamily: 'Syne', fontSize: 15, fontWeight: 700, marginBottom: 6 }}>{f.title}</h3>
              <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── POUR QUI ── */}
      <section style={{ padding: '40px 20px', background: 'var(--card)', borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'Syne', fontSize: 'clamp(18px, 4vw, 24px)', fontWeight: 800, marginBottom: 24 }}>
            Créé pour toi si tu es...
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 10 }}>
            {['Étudiant', 'Entrepreneur', 'Freelance', 'Étudiant-entrepreneur', 'Side-hustler', 'Auto-didacte'].map(r => (
              <span key={r} style={{ background: 'var(--gold-dim)', border: '1px solid rgba(245,197,24,.2)',
                borderRadius: 999, padding: '8px 18px', fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
                {r}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── TÉMOIGNAGES ── */}
      <section style={{ padding: '48px 20px', maxWidth: 700, margin: '0 auto' }}>
        <h2 style={{ fontFamily: 'Syne', fontSize: 'clamp(18px, 4vw, 24px)', fontWeight: 800,
          textAlign: 'center', marginBottom: 28 }}>
          Ce qu'ils en disent
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
          {TESTIMONIALS.map((t, i) => (
            <div key={i} style={{ background: 'var(--card)', border: '1px solid var(--border)',
              borderRadius: 14, padding: '20px 18px' }}>
              <p style={{ fontSize: 14, lineHeight: 1.7, margin: '0 0 12px', fontStyle: 'italic' }}>
                "{t.text}"
              </p>
              <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, fontWeight: 600 }}>— {t.author}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── COMMENT ÇA MARCHE ── */}
      <section style={{ padding: '40px 20px', background: 'var(--card)', borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'Syne', fontSize: 'clamp(18px, 4vw, 24px)', fontWeight: 800,
            textAlign: 'center', marginBottom: 28 }}>
            3 secondes pour commencer
          </h2>
          {[
            { step: '1', title: 'Entre ton prénom', desc: 'Pas de compte. Pas d\'email. Juste ton prénom.' },
            { step: '2', title: 'Explore le dashboard', desc: 'Tout est prêt avec des exemples. Modifie, supprime, ajoute.' },
            { step: '3', title: 'Prends ta vie en main', desc: 'Tes données restent dans ton navigateur, disponibles hors-ligne.' },
          ].map(s => (
            <div key={s.step} style={{ display: 'flex', gap: 16, marginBottom: 20, alignItems: 'flex-start' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg, #F5C518, #d4a500)', color: '#0A0E1A',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'Syne', fontWeight: 800, fontSize: 16 }}>
                {s.step}
              </div>
              <div>
                <p style={{ fontWeight: 700, fontSize: 15, margin: '0 0 3px' }}>{s.title}</p>
                <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0, lineHeight: 1.5 }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section style={{ padding: '60px 20px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'Syne', fontSize: 'clamp(20px, 5vw, 32px)', fontWeight: 800, marginBottom: 12 }}>
          Prêt à reprendre le contrôle ?
        </h2>
        <p style={{ color: 'var(--muted)', fontSize: 15, marginBottom: 28, maxWidth: 400, margin: '0 auto 28px' }}>
          Rejoins les étudiants-entrepreneurs qui organisent leur vie avec Personal OS.
        </p>
        <button onClick={() => setShowSetup(true)}
          style={{ background: 'linear-gradient(135deg, #F5C518 0%, #d4a500 100%)', color: '#0A0E1A',
            border: 'none', borderRadius: 12, padding: '16px 40px', fontSize: 17, fontWeight: 800,
            fontFamily: 'Syne', cursor: 'pointer', boxShadow: '0 4px 20px rgba(245,197,24,.3)' }}>
          Commencer gratuitement →
        </button>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ padding: '24px 20px', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
        <p style={{ fontFamily: 'Syne', fontWeight: 800, color: '#F5C518', fontSize: 16, marginBottom: 4 }}>
          Personal OS
        </p>
        <p style={{ fontSize: 12, color: 'var(--muted)' }}>
          Fait avec passion à Dakar 🇸🇳 — par un étudiant, pour les étudiants.
        </p>
      </footer>

      {/* ── SETUP MODAL ── */}
      {showSetup && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.75)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 16 }}
          onClick={() => setShowSetup(false)}>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16,
            padding: 28, width: '100%', maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontFamily: 'Syne', fontSize: 20, marginBottom: 4, color: '#F5C518' }}>
              Bienvenue !
            </h3>
            <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 20, lineHeight: 1.6 }}>
              Juste ton prénom pour personnaliser ton dashboard.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input value={form.prenom} onChange={e => setForm({ ...form, prenom: e.target.value })}
                placeholder="Prénom *" autoFocus
                onKeyDown={e => e.key === 'Enter' && save()} />
              <input value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })}
                placeholder="Nom (optionnel)" />
              <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                <option>Étudiant-entrepreneur</option><option>Étudiant</option>
                <option>Entrepreneur</option><option>Freelance</option><option>Autre</option>
              </select>
            </div>
            <button onClick={save} disabled={!form.prenom.trim()}
              style={{ width: '100%', marginTop: 20, background: 'linear-gradient(135deg, #F5C518 0%, #d4a500 100%)',
                color: '#0A0E1A', border: 'none', borderRadius: 10, padding: '14px 20px', fontSize: 15,
                fontWeight: 800, fontFamily: 'Syne', cursor: 'pointer',
                opacity: form.prenom.trim() ? 1 : .5 }}>
              Commencer →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
