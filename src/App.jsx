import { useState } from 'react'
import { useApp } from './context/AppContext'
import LandingPage from './components/LandingPage'
import Dashboard from './components/Dashboard'
import Taches from './components/Taches'
import Projets from './components/Projets'
import Ecole from './components/Ecole'
import Finances from './components/Finances'
import Ajustements from './components/Ajustements'
import Stats from './components/Stats'
import PomodoroModal from './components/shared/PomodoroModal'
import GlobalSearch from './components/shared/GlobalSearch'
import {
  LayoutDashboard, CheckSquare, Target, GraduationCap, Wallet,
  BarChart3, RefreshCw, Search, User, Bell, BellOff, Save,
  KeyRound, Sun, Moon, LogOut, MoreHorizontal
} from 'lucide-react'

const ICON_SIZE = 18

const TABS = [
  { id: 'dashboard',   icon: <LayoutDashboard size={ICON_SIZE} />,  label: 'Dashboard'      },
  { id: 'taches',      icon: <CheckSquare size={ICON_SIZE} />,      label: 'Tâches'          },
  { id: 'projets',     icon: <Target size={ICON_SIZE} />,           label: 'Projets & Idées' },
  { id: 'ecole',       icon: <GraduationCap size={ICON_SIZE} />,    label: 'École'           },
  { id: 'finances',    icon: <Wallet size={ICON_SIZE} />,           label: 'Finances'        },
  { id: 'stats',       icon: <BarChart3 size={ICON_SIZE} />,        label: 'Statistiques'    },
  { id: 'ajustements', icon: <RefreshCw size={ICON_SIZE} />,        label: 'Ajustements'     },
]

function SetupModal({ onSave }) {
  const [form, setForm] = useState({ prenom: '', nom: '', role: 'Étudiant-entrepreneur' })
  const save = () => { if (!form.prenom.trim()) return; onSave(form) }
  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }}>
      <div className="modal-box">
        <h3 style={{ fontSize: 22, marginBottom: 4, color: '#F5C518' }}>👋 Bienvenue sur Personal OS</h3>
        <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 24, lineHeight: 1.6 }}>
          Commence par te présenter. Ces infos restent dans ton navigateur.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input value={form.prenom} onChange={e => setForm({ ...form, prenom: e.target.value })}
            placeholder="Prénom *" autoFocus />
          <input value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })}
            placeholder="Nom (optionnel)" />
          <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
            <option>Étudiant-entrepreneur</option><option>Étudiant</option>
            <option>Entrepreneur</option><option>Freelance</option><option>Autre</option>
          </select>
        </div>
        <button className="btn-gold" style={{ width: '100%', marginTop: 20 }} onClick={save}
          disabled={!form.prenom.trim()}>Commencer →</button>
      </div>
    </div>
  )
}

function ProfileModal({ profile, onSave, onClose }) {
  const [form, setForm] = useState({ prenom: profile?.prenom || '', nom: profile?.nom || '', role: profile?.role || 'Étudiant-entrepreneur' })
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <h3 style={{ fontSize: 18, marginBottom: 16, color: '#F5C518' }}>👤 Mon profil</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input value={form.prenom} onChange={e => setForm({ ...form, prenom: e.target.value })} placeholder="Prénom *" autoFocus />
          <input value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} placeholder="Nom (optionnel)" />
          <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
            <option>Étudiant-entrepreneur</option><option>Étudiant</option>
            <option>Entrepreneur</option><option>Freelance</option><option>Autre</option>
          </select>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
          <button className="btn-gold" onClick={() => onSave(form)} disabled={!form.prenom.trim()}>Enregistrer</button>
          <button className="btn-ghost" onClick={onClose}>Annuler</button>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const app = useApp()
  const {
    tab, setTab, profile, setProfile, apiKey, setApiKey,
    adjustments, pomo, pausePomo, stopPomo, donePomo,
    theme, toggleTheme, notifEnabled, setNotifEnabled, enableNotifications,
    searchOpen, setSearchOpen, apiModal, setApiModal,
    profileModal, setProfileModal, backupModal, setBackupModal,
    importRef, exportData, importData,
    tasks, devoirs, examens, projects,
  } = app
  const [mobileMore, setMobileMore] = useState(false)
  const [loggedOut, setLoggedOut] = useState(false)

  const logout = () => setLoggedOut(true)
  const handleStart = (formData) => {
    setProfile(formData)
    setLoggedOut(false)
  }

  const adjBadge = adjustments.length > 0 && (
    <span style={{ background: '#f87171', color: '#fff', borderRadius: '50%', width: 18, height: 18,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, marginLeft: 'auto' }}>
      {adjustments.length}
    </span>
  )

  // ── Nouveau visiteur OU déconnecté → Landing Page ──
  if (!profile || loggedOut) {
    return <LandingPage onStart={handleStart} />
  }

  return (
    <div>
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div style={{ paddingLeft: 8, marginBottom: 28 }}>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: '#F5C518', letterSpacing: '-0.5px' }}>Personal OS</h1>
          <p style={{ color: 'var(--muted)', fontSize: 11, marginTop: 3 }}>Dashboard Pro · Dakar</p>
        </div>

        <button onClick={() => setSearchOpen(true)} aria-label="Rechercher"
          style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px',
            background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: 8,
            color: 'var(--muted)', fontSize: 13, cursor: 'pointer', marginBottom: 16,
            fontFamily: 'DM Sans', transition: 'border-color .2s' }}>
          <Search size={14} />
          <span style={{ flex: 1, textAlign: 'left' }}>Rechercher...</span>
          <kbd style={{ background: 'var(--bar-bg)', border: '1px solid var(--border)', borderRadius: 4,
            padding: '1px 6px', fontSize: 10 }}>⌘K</kbd>
        </button>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
          {TABS.map(t => (
            <div key={t.id} className={`nav-item${tab === t.id ? ' active' : ''}`} onClick={() => setTab(t.id)}>
              <span className="nav-icon">{t.icon}</span>
              <span style={{ flex: 1 }}>{t.label}</span>
              {t.id === 'ajustements' && adjustments.length > 0 && adjBadge}
            </div>
          ))}
        </nav>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {profile && (
            <button className="btn-ghost" style={{ width: '100%', fontSize: 12, padding: '8px 12px', textAlign: 'left' }}
              onClick={() => setProfileModal(true)}>
              <User size={13} style={{ display: 'inline', verticalAlign: -2, marginRight: 4 }} /> {profile.prenom} {profile.nom || ''} <span style={{ color: 'var(--muted)', fontSize: 11 }}>— Modifier</span>
            </button>
          )}
          <button className="btn-ghost" style={{ width: '100%', fontSize: 12, padding: '8px 12px',
            color: notifEnabled ? '#4ade80' : undefined }}
            onClick={notifEnabled ? () => setNotifEnabled(false) : enableNotifications}>
            {notifEnabled
              ? <><Bell size={13} style={{ display: 'inline', verticalAlign: -2, marginRight: 4 }} /> Notifications activées</>
              : <><BellOff size={13} style={{ display: 'inline', verticalAlign: -2, marginRight: 4 }} /> Activer les notifications</>}
          </button>
          {notifEnabled && (
            <p style={{ fontSize: 10, color: 'var(--muted)', padding: '0 12px', margin: 0, lineHeight: 1.4 }}>
              Fonctionne uniquement quand l'app est ouverte. Pour les rappels hors-ligne, ajoute l'app à ton écran d'accueil.
            </p>
          )}
          <button className="btn-ghost" style={{ width: '100%', fontSize: 12, padding: '8px 12px' }}
            onClick={() => setBackupModal(true)}>
            <Save size={13} style={{ display: 'inline', verticalAlign: -2, marginRight: 4 }} /> Sauvegarde / Restauration
          </button>
          <button className="btn-ghost" style={{ width: '100%', fontSize: 12, padding: '8px 12px' }}
            onClick={() => setApiModal(true)}>
            <KeyRound size={13} style={{ display: 'inline', verticalAlign: -2, marginRight: 4 }} /> Clé API Gemini (gratuit)
          </button>
          <button className="btn-ghost" style={{ width: '100%', fontSize: 12, padding: '8px 12px' }}
            onClick={toggleTheme}>
            {theme === 'dark'
              ? <><Sun size={13} style={{ display: 'inline', verticalAlign: -2, marginRight: 4 }} /> Thème clair</>
              : <><Moon size={13} style={{ display: 'inline', verticalAlign: -2, marginRight: 4 }} /> Thème sombre</>}
          </button>
          <button className="btn-ghost" style={{ width: '100%', fontSize: 12, padding: '8px 12px',
            color: '#f87171', borderColor: 'rgba(248,113,113,.25)', marginTop: 4 }}
            onClick={logout}>
            <LogOut size={13} style={{ display: 'inline', verticalAlign: -2, marginRight: 4 }} /> Déconnexion
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="main-content">
        <div className="page-enter" key={tab}>
          {tab === 'dashboard'   && <Dashboard />}
          {tab === 'taches'      && <Taches />}
          {tab === 'projets'     && <Projets />}
          {tab === 'ecole'       && <Ecole />}
          {tab === 'finances'    && <Finances />}
          {tab === 'stats'       && <Stats />}
          {tab === 'ajustements' && <Ajustements />}
        </div>
      </main>

      {/* BOTTOM NAV (mobile) — 5 onglets principaux */}
      <nav className="bottom-nav">
        {TABS.filter(t => ['dashboard', 'taches', 'projets', 'finances', 'stats'].includes(t.id)).map(t => (
          <button key={t.id} onClick={() => { setTab(t.id); setMobileMore(false) }} aria-label={t.label}
            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: 2, padding: '4px 6px', flex: 1,
              color: tab === t.id ? '#F5C518' : 'var(--muted)' }}>
            <span>{t.icon}</span>
            <span style={{ fontSize: 9, fontFamily: 'DM Sans', fontWeight: 500 }}>{t.label.split(' ')[0]}</span>
          </button>
        ))}
        <button onClick={() => setMobileMore(m => !m)} aria-label="Plus d'options"
          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: 2, padding: '4px 6px', flex: 1, position: 'relative',
            color: ['ecole', 'ajustements'].includes(tab) ? '#F5C518' : 'var(--muted)' }}>
          <MoreHorizontal size={20} />
          <span style={{ fontSize: 9, fontFamily: 'DM Sans', fontWeight: 500 }}>Plus</span>
          {adjustments.length > 0 && (
            <span style={{ position: 'absolute', top: 0, right: 2, background: '#f87171', color: '#fff',
              borderRadius: '50%', width: 14, height: 14, fontSize: 9,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
              {adjustments.length}
            </span>
          )}
        </button>
      </nav>

      {/* MOBILE MORE MENU */}
      {mobileMore && (
        <div style={{ position: 'fixed', bottom: 62, left: 0, right: 0, zIndex: 201,
          padding: '0 10px', display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12,
            padding: 8, display: 'flex', flexDirection: 'column', gap: 2, minWidth: 180,
            boxShadow: '0 -4px 20px rgba(0,0,0,.3)' }}>
            {TABS.filter(t => ['ecole', 'ajustements'].includes(t.id)).map(t => (
              <button key={t.id} onClick={() => { setTab(t.id); setMobileMore(false) }}
                style={{ background: tab === t.id ? 'var(--gold-dim)' : 'none', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 8,
                  color: tab === t.id ? '#F5C518' : 'var(--text)', fontFamily: 'DM Sans', fontSize: 14,
                  fontWeight: tab === t.id ? 600 : 400, width: '100%', textAlign: 'left' }}>
                <span>{t.icon}</span>
                {t.label}
                {t.id === 'ajustements' && adjustments.length > 0 && (
                  <span style={{ marginLeft: 'auto', background: '#f87171', color: '#fff', borderRadius: '50%',
                    width: 18, height: 18, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, fontWeight: 700 }}>{adjustments.length}</span>
                )}
              </button>
            ))}
            <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
            <button onClick={() => { setMobileMore(false); toggleTheme() }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center',
                gap: 10, padding: '10px 14px', borderRadius: 8, color: 'var(--text)', fontFamily: 'DM Sans',
                fontSize: 14, width: '100%', textAlign: 'left' }}>
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              {theme === 'dark' ? 'Thème clair' : 'Thème sombre'}
            </button>
            <button onClick={() => { setMobileMore(false); notifEnabled ? setNotifEnabled(false) : enableNotifications() }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center',
                gap: 10, padding: '10px 14px', borderRadius: 8, color: notifEnabled ? '#4ade80' : 'var(--text)',
                fontFamily: 'DM Sans', fontSize: 14, width: '100%', textAlign: 'left' }}>
              {notifEnabled ? <Bell size={18} /> : <BellOff size={18} />}
              {notifEnabled ? 'Notifications ON' : 'Notifications'}
            </button>
            <button onClick={() => { setMobileMore(false); setBackupModal(true) }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center',
                gap: 10, padding: '10px 14px', borderRadius: 8, color: 'var(--text)', fontFamily: 'DM Sans',
                fontSize: 14, width: '100%', textAlign: 'left' }}>
              <Save size={18} />
              Sauvegarde
            </button>
            <button onClick={() => { setMobileMore(false); setApiModal(true) }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center',
                gap: 10, padding: '10px 14px', borderRadius: 8, color: 'var(--text)', fontFamily: 'DM Sans',
                fontSize: 14, width: '100%', textAlign: 'left' }}>
              <KeyRound size={18} />
              Clé API
            </button>
            {profile && (
              <button onClick={() => { setMobileMore(false); setProfileModal(true) }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center',
                  gap: 10, padding: '10px 14px', borderRadius: 8, color: 'var(--text)', fontFamily: 'DM Sans',
                  fontSize: 14, width: '100%', textAlign: 'left' }}>
                <User size={18} />
                {profile.prenom}
              </button>
            )}
            <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
            <button onClick={() => { setMobileMore(false); logout() }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center',
                gap: 10, padding: '10px 14px', borderRadius: 8, color: '#f87171', fontFamily: 'DM Sans',
                fontSize: 14, width: '100%', textAlign: 'left' }}>
              <LogOut size={18} />
              Déconnexion
            </button>
          </div>
        </div>
      )}

      {/* SETUP PROFIL — remplacé par LandingPage, rendu plus haut */}

      {/* MODIFIER PROFIL */}
      {profileModal && (
        <ProfileModal profile={profile} onSave={p => { setProfile(p); setProfileModal(false) }} onClose={() => setProfileModal(false)} />
      )}

      {/* BACKUP / RESTORE */}
      {backupModal && (
        <div className="modal-overlay" onClick={() => setBackupModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 18, marginBottom: 8, color: '#F5C518' }}>💾 Sauvegarde & Restauration</h3>
            <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 20, lineHeight: 1.6 }}>
              Toutes tes données sont dans le navigateur. Exporte régulièrement pour ne rien perdre.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button className="btn-gold" onClick={exportData} style={{ textAlign: 'left', padding: '12px 16px' }}>
                ⬇️ Exporter mes données (JSON)
                <span style={{ display: 'block', fontSize: 11, fontWeight: 400, marginTop: 2, color: 'rgba(15,23,42,.7)' }}>
                  Tâches, projets, finances, école, profil
                </span>
              </button>
              <button className="btn-ghost" onClick={() => importRef.current?.click()} style={{ textAlign: 'left', padding: '12px 16px' }}>
                ⬆️ Restaurer depuis un fichier
                <span style={{ display: 'block', fontSize: 11, fontWeight: 400, marginTop: 2, color: 'var(--muted)' }}>
                  Remplace toutes les données actuelles
                </span>
              </button>
              <input ref={importRef} type="file" accept=".json" onChange={importData} style={{ display: 'none' }} />
            </div>
            <button className="btn-ghost" style={{ width: '100%', marginTop: 16 }} onClick={() => setBackupModal(false)}>Fermer</button>
          </div>
        </div>
      )}

      {/* POMODORO */}
      {pomo && <PomodoroModal pomo={pomo} onPause={pausePomo} onStop={stopPomo} onDone={donePomo} />}

      {/* GLOBAL SEARCH */}
      {searchOpen && (
        <GlobalSearch
          tasks={tasks} devoirs={devoirs} examens={examens} projects={projects}
          onNavigate={setTab} onClose={() => setSearchOpen(false)}
        />
      )}

      {/* API KEY MODAL */}
      {apiModal && (
        <div className="modal-overlay" onClick={() => setApiModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 18, marginBottom: 8, color: '#F5C518' }}>🔑 Clé API Gemini (gratuit)</h3>
            <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 16, lineHeight: 1.6 }}>
              Clé 100% gratuite, stockée uniquement dans ton navigateur.<br />
              Obtiens-la sur <strong style={{ color: 'var(--text)' }}>aistudio.google.com/apikey</strong>
            </p>
            <input type="password" value={apiKey} onChange={e => setApiKey(e.target.value)}
              placeholder="AIzaSy..." style={{ marginBottom: 10 }} />
            <p style={{ fontSize: 11, color: '#f97316', margin: '0 0 14px', lineHeight: 1.5,
              background: 'rgba(249,115,22,.06)', border: '1px solid rgba(249,115,22,.2)',
              borderRadius: 6, padding: '8px 10px' }}>
              🔒 Ta clé est stockée localement. Ne partage pas ce navigateur et ne l'utilise pas sur un appareil public.
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn-gold" onClick={() => setApiModal(false)}>Enregistrer</button>
              <button className="btn-ghost" onClick={() => setApiModal(false)}>Fermer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
