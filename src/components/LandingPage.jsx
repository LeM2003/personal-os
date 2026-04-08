import { useState, useEffect } from 'react'

const PROBLEMS = [
  { icon: '📱', text: 'Tes notes dans WhatsApp, tes cours sur papier, tes deadlines dans ta tête.' },
  { icon: '💸', text: 'Ton argent part sans que tu saches où. Aucun suivi, aucun budget.' },
  { icon: '🌀', text: 'Tu jongles entre 5 apps et tu finis par n\'utiliser aucune.' },
]

const FEATURES = [
  { icon: '✅', title: 'Tâches intelligentes', desc: 'Priorités, deadlines, filtres, timer Pomodoro intégré. Ne rate plus rien.' },
  { icon: '💰', title: 'Budget en FCFA', desc: 'Suis tes dépenses par catégorie, fixe des budgets, visualise où va ton argent.' },
  { icon: '📚', title: 'Suivi scolaire', desc: 'Emploi du temps, devoirs, examens, révisions — tout au même endroit.' },
  { icon: '🎯', title: 'Projets & Idées', desc: 'Transforme tes idées en projets avec étapes, notes et suivi de progression.' },
  { icon: '📊', title: 'Score de productivité', desc: 'Vois ta performance sur 7 jours, tes habitudes, ta discipline — en un coup d\'œil.' },
  { icon: '🤖', title: 'IA intégrée', desc: 'Analyse tes projets et importe tes tâches par texte grâce à l\'IA (gratuit).' },
]

const STATS = [
  { value: '0 FCFA', label: 'Pour toujours' },
  { value: '0', label: 'Téléchargement' },
  { value: '30s', label: 'Pour commencer' },
  { value: '∞', label: 'Hors connexion' },
]

const TESTIMONIALS = [
  { text: "J'ai enfin un endroit où je vois mes cours, mes dépenses et mes projets sans jongler entre 5 apps.", author: 'Étudiant, UCAD', initials: 'AM' },
  { text: "Le suivi budget en FCFA c'est ce qui manquait. Je sais enfin où passe mon argent chaque mois.", author: 'Entrepreneur, Dakar', initials: 'SD' },
  { text: "Le Pomodoro intégré aux tâches c'est game changer. Je procrastine beaucoup moins.", author: 'Étudiante, ISM', initials: 'FK' },
]

const CTA_BTN = {
  background: 'linear-gradient(135deg, #F5C518 0%, #d4a500 100%)',
  color: '#0A0E1A', border: 'none', borderRadius: 12,
  padding: '16px 40px', fontSize: 17, fontWeight: 800,
  fontFamily: 'Syne', cursor: 'pointer',
  transition: 'transform .15s, box-shadow .2s',
  boxShadow: '0 4px 24px rgba(245,197,24,.35)',
}

export default function LandingPage({ onStart }) {
  const [form, setForm] = useState({ prenom: '', nom: '', role: 'Étudiant-entrepreneur' })
  const [showSetup, setShowSetup] = useState(false)
  const [showSticky, setShowSticky] = useState(false)

  const save = () => { if (!form.prenom.trim()) return; onStart(form) }

  // Sticky CTA on mobile — appears after scrolling past hero
  useEffect(() => {
    const onScroll = () => setShowSticky(window.scrollY > 400)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', overflowX: 'hidden' }}>

      {/* ── HERO ── */}
      <header style={{ padding: '56px 20px 40px', textAlign: 'center', maxWidth: 700, margin: '0 auto' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--gold-dim)',
          border: '1px solid rgba(245,197,24,.2)', borderRadius: 999, padding: '6px 16px', marginBottom: 24 }}>
          <span style={{ fontSize: 12, color: 'var(--gold)', fontWeight: 600 }}>100% gratuit — aucun compte requis</span>
        </div>

        <h1 style={{ fontFamily: 'Syne', fontSize: 'clamp(26px, 6vw, 48px)', fontWeight: 800,
          lineHeight: 1.12, marginBottom: 18 }}>
          Tes cours. Tes projets. Tes finances.{' '}
          <span style={{ color: '#F5C518', display: 'inline-block' }}>Un seul système.</span>
        </h1>

        <p style={{ fontSize: 'clamp(15px, 3vw, 18px)', color: 'var(--muted)', lineHeight: 1.7,
          maxWidth: 520, margin: '0 auto 32px' }}>
          Personal OS est le dashboard conçu pour les étudiants qui construisent quelque chose.
          Organise ta vie en 30 secondes — sans inscription, sans téléchargement.
        </p>

        <button onClick={() => setShowSetup(true)} style={CTA_BTN}
          onMouseOver={e => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 6px 30px rgba(245,197,24,.45)' }}
          onMouseOut={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 24px rgba(245,197,24,.35)' }}>
          C'est gratuit, je commence →
        </button>

        <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 14 }}>
          Tes données restent dans ton navigateur. Rien n'est envoyé nulle part.
        </p>
      </header>

      {/* ── STATS BAR ── */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 'clamp(16px, 4vw, 40px)',
        padding: '24px 20px', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)',
        maxWidth: 600, margin: '0 auto' }}>
        {STATS.map(s => (
          <div key={s.label} style={{ textAlign: 'center' }}>
            <p style={{ fontFamily: 'Syne', fontSize: 'clamp(18px, 4vw, 26px)', fontWeight: 800, color: '#F5C518', margin: 0 }}>
              {s.value}
            </p>
            <p style={{ fontSize: 11, color: 'var(--muted)', margin: '2px 0 0', textTransform: 'uppercase',
              letterSpacing: .5 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── LE PROBLÈME ── */}
      <section style={{ padding: '48px 20px', maxWidth: 700, margin: '0 auto' }}>
        <h2 style={{ fontFamily: 'Syne', fontSize: 'clamp(20px, 4vw, 28px)', fontWeight: 800,
          textAlign: 'center', marginBottom: 8 }}>
          On connaît le <span style={{ color: '#f87171' }}>chaos.</span>
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 14, marginBottom: 32, maxWidth: 480, margin: '0 auto 32px' }}>
          Être étudiant et entrepreneur en même temps, c'est gérer 10 trucs à la fois sans aucun système.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {PROBLEMS.map((p, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 16,
              background: 'rgba(248,113,113,.05)', border: '1px solid rgba(248,113,113,.15)',
              borderRadius: 12, padding: '16px 18px',
            }}>
              <span style={{ fontSize: 28, flexShrink: 0 }}>{p.icon}</span>
              <p style={{ fontSize: 14, color: 'var(--text)', margin: 0, lineHeight: 1.6, opacity: .85 }}>{p.text}</p>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: 28 }}>
          <p style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 16, color: '#F5C518' }}>
            Personal OS règle tout ça. En un seul endroit.
          </p>
        </div>
      </section>

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
              borderRadius: 14, padding: '22px 20px', transition: 'border-color .2s, transform .2s' }}
              onMouseOver={e => { e.currentTarget.style.borderColor = 'rgba(245,197,24,.3)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)' }}>
              <span style={{ fontSize: 30, display: 'block', marginBottom: 12 }}>{f.icon}</span>
              <h3 style={{ fontFamily: 'Syne', fontSize: 15, fontWeight: 700, marginBottom: 6 }}>{f.title}</h3>
              <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA MILIEU ── */}
      <section style={{ padding: '32px 20px', textAlign: 'center' }}>
        <button onClick={() => setShowSetup(true)}
          style={{ ...CTA_BTN, padding: '14px 36px', fontSize: 16 }}
          onMouseOver={e => e.target.style.transform = 'translateY(-2px)'}
          onMouseOut={e => e.target.style.transform = 'translateY(0)'}>
          Commencer gratuitement →
        </button>
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
                borderRadius: 999, padding: '10px 20px', fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
                {r}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── TÉMOIGNAGES ── */}
      <section style={{ padding: '48px 20px', maxWidth: 800, margin: '0 auto' }}>
        <h2 style={{ fontFamily: 'Syne', fontSize: 'clamp(18px, 4vw, 24px)', fontWeight: 800,
          textAlign: 'center', marginBottom: 28 }}>
          Ce qu'ils en disent
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          {TESTIMONIALS.map((t, i) => (
            <div key={i} style={{ background: 'var(--card)', border: '1px solid var(--border)',
              borderRadius: 14, padding: '22px 20px' }}>
              <p style={{ fontSize: 14, lineHeight: 1.7, margin: '0 0 16px', fontStyle: 'italic', opacity: .9 }}>
                "{t.text}"
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                  background: 'var(--gold-dim)', border: '1px solid rgba(245,197,24,.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'Syne', fontWeight: 700, fontSize: 13, color: '#F5C518' }}>
                  {t.initials}
                </div>
                <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, fontWeight: 600 }}>{t.author}</p>
              </div>
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
            { step: '1', title: 'Entre ton prénom', desc: 'Pas de compte. Pas d\'email. Pas de mot de passe. Juste ton prénom.' },
            { step: '2', title: 'Explore le dashboard', desc: 'Tout est prêt avec des exemples. Modifie, supprime, ajoute comme tu veux.' },
            { step: '3', title: 'Prends ta vie en main', desc: 'Tes données restent dans ton navigateur, disponibles même hors connexion.' },
          ].map(s => (
            <div key={s.step} style={{ display: 'flex', gap: 16, marginBottom: 22, alignItems: 'flex-start' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg, #F5C518, #d4a500)', color: '#0A0E1A',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'Syne', fontWeight: 800, fontSize: 17 }}>
                {s.step}
              </div>
              <div>
                <p style={{ fontWeight: 700, fontSize: 15, margin: '0 0 4px' }}>{s.title}</p>
                <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section style={{ padding: '64px 20px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'Syne', fontSize: 'clamp(20px, 5vw, 32px)', fontWeight: 800, marginBottom: 12 }}>
          Prêt à reprendre le contrôle ?
        </h2>
        <p style={{ color: 'var(--muted)', fontSize: 15, marginBottom: 28, maxWidth: 420, margin: '0 auto 28px', lineHeight: 1.6 }}>
          Rejoins les étudiants-entrepreneurs qui organisent leur vie avec Personal OS.
          C'est gratuit. C'est rapide. C'est maintenant.
        </p>
        <button onClick={() => setShowSetup(true)} style={CTA_BTN}
          onMouseOver={e => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 6px 30px rgba(245,197,24,.45)' }}
          onMouseOut={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 24px rgba(245,197,24,.35)' }}>
          C'est gratuit, je commence →
        </button>
        <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 14 }}>
          Pas de carte bancaire. Pas de spam. Juste toi et ton dashboard.
        </p>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ padding: '28px 20px', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
        <p style={{ fontFamily: 'Syne', fontWeight: 800, color: '#F5C518', fontSize: 16, marginBottom: 4 }}>
          Personal OS
        </p>
        <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 0 }}>
          Fait avec passion à Dakar — par un étudiant, pour les étudiants.
        </p>
      </footer>

      {/* ── STICKY CTA MOBILE ── */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 998,
        padding: '12px 16px', paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 0px))',
        background: 'linear-gradient(to top, var(--bg) 60%, transparent)',
        textAlign: 'center',
        transform: showSticky && !showSetup ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform .3s ease',
        pointerEvents: showSticky && !showSetup ? 'auto' : 'none',
      }}>
        <button onClick={() => setShowSetup(true)}
          style={{ ...CTA_BTN, width: '100%', maxWidth: 400, padding: '14px 20px', fontSize: 15 }}>
          C'est gratuit, je commence →
        </button>
      </div>

      {/* ── SETUP MODAL ── */}
      {showSetup && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.75)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 16 }}
          onClick={() => setShowSetup(false)}>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16,
            padding: 28, width: '100%', maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontFamily: 'Syne', fontSize: 22, marginBottom: 4, color: '#F5C518' }}>
              Bienvenue !
            </h3>
            <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 20, lineHeight: 1.6 }}>
              Juste ton prénom pour personnaliser ton dashboard. Rien d'autre.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input value={form.prenom} onChange={e => setForm({ ...form, prenom: e.target.value })}
                placeholder="Prénom *" autoFocus
                onKeyDown={e => e.key === 'Enter' && save()} />
              <input value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })}
                placeholder="Nom (optionnel)"
                onKeyDown={e => e.key === 'Enter' && save()} />
              <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                <option>Étudiant-entrepreneur</option><option>Étudiant</option>
                <option>Entrepreneur</option><option>Freelance</option><option>Autre</option>
              </select>
            </div>
            <button onClick={save} disabled={!form.prenom.trim()}
              style={{ width: '100%', marginTop: 20, background: 'linear-gradient(135deg, #F5C518 0%, #d4a500 100%)',
                color: '#0A0E1A', border: 'none', borderRadius: 10, padding: '14px 20px', fontSize: 15,
                fontWeight: 800, fontFamily: 'Syne', cursor: 'pointer',
                opacity: form.prenom.trim() ? 1 : .5, transition: 'opacity .2s' }}>
              Commencer →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
