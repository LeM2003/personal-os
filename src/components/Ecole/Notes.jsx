import { useMemo, useState } from 'react'
import { useApp } from '../../context/AppContext'
import { genId, todayISO } from '../../utils/dates'
import { haptic, hapticSuccess } from '../../utils/haptics'
import BottomSheet from '../shared/BottomSheet'

const SUBJECTS = [
  { id: 'math', name: 'Maths',        short: 'M', coef: 7 },
  { id: 'phy',  name: 'Physique',     short: 'P', coef: 6 },
  { id: 'svt',  name: 'SVT',          short: 'S', coef: 6 },
  { id: 'fr',   name: 'Français',     short: 'F', coef: 4 },
  { id: 'phi',  name: 'Philo',        short: 'Φ', coef: 3 },
  { id: 'ang',  name: 'Anglais',      short: 'A', coef: 3 },
  { id: 'hg',   name: 'Histoire-Géo', short: 'H', coef: 3 },
  { id: 'info', name: 'Info',         short: 'I', coef: 2 },
]
const SUBJ_BY_ID = Object.fromEntries(SUBJECTS.map(s => [s.id, s]))
const TYPES = ['Contrôle', 'DS', 'Oral']

const gradeColor = (n) => {
  if (n < 10) return '#f87171'
  if (n < 12) return '#fb923c'
  if (n >= 16) return '#4ade80'
  return '#5B8DBF'
}

const fmtShortDate = (iso) => {
  if (!iso) return ''
  const d = new Date(iso)
  const m = ['janv.','févr.','mars','avr.','mai','juin','juil.','août','sept.','oct.','nov.','déc.'][d.getMonth()]
  return `${d.getDate().toString().padStart(2, '0')} ${m}`
}

export default function Notes() {
  const { notes, setNotes } = useApp()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editId, setEditId] = useState(null)

  // Moyennes par matière (pondérées par coef des notes)
  const subjectStats = useMemo(() => {
    const m = new Map()
    for (const n of notes) {
      if (!m.has(n.subjectId)) m.set(n.subjectId, { w: 0, c: 0, count: 0, last: null })
      const s = m.get(n.subjectId)
      s.w += n.grade * (n.coef || 1)
      s.c += (n.coef || 1)
      s.count++
      if (!s.last || n.date > s.last) s.last = n.date
    }
    return Array.from(m.entries()).map(([id, s]) => ({
      id, subj: SUBJ_BY_ID[id], avg: s.c > 0 ? s.w / s.c : 0, count: s.count, last: s.last,
    }))
  }, [notes])

  // Moyenne générale pondérée (coef matière × coef note)
  const generalAvg = useMemo(() => {
    let w = 0, c = 0
    for (const stat of subjectStats) {
      const coefMat = stat.subj?.coef || 1
      w += stat.avg * coefMat
      c += coefMat
    }
    return c > 0 ? w / c : 0
  }, [subjectStats])

  // Dernières notes (triées par date desc)
  const recentNotes = useMemo(
    () => [...notes].sort((a, b) => (b.date || '').localeCompare(a.date || '')).slice(0, 8),
    [notes]
  )

  const isEmpty = notes.length === 0

  const openAdd = () => { haptic(5); setEditId(null); setSheetOpen(true) }
  const openEdit = (noteId) => { setEditId(noteId); setSheetOpen(true) }
  const closeSheet = () => { setSheetOpen(false); setEditId(null) }

  const saveNote = (draft) => {
    if (editId) {
      setNotes(p => p.map(n => n.id === editId ? { ...n, ...draft } : n))
    } else {
      setNotes(p => [...p, { id: genId(), ...draft }])
    }
    hapticSuccess()
    closeSheet()
  }

  const deleteNote = (id) => {
    setNotes(p => p.filter(n => n.id !== id))
    haptic(8)
    closeSheet()
  }

  return (
    <div style={{ paddingBottom: 120 }}>
      {isEmpty ? (
        <EmptyState onAdd={openAdd} />
      ) : (
        <>
          {/* Hero band moyenne générale */}
          <HeroAvg avg={generalAvg} stats={subjectStats} />

          {/* Liste matières avec moyenne */}
          {subjectStats.length > 0 && (
            <section style={{ marginBottom: 20 }}>
              <SectionTitle>Par matière</SectionTitle>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {subjectStats
                  .sort((a, b) => a.avg - b.avg)
                  .map(s => <SubjectRow key={s.id} stat={s} />)}
              </div>
            </section>
          )}

          {/* Dernières notes */}
          <section>
            <SectionTitle>Dernières notes</SectionTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {recentNotes.map(n => (
                <RecentNote key={n.id} note={n} onEdit={() => openEdit(n.id)} />
              ))}
            </div>
          </section>
        </>
      )}

      {/* FAB "Nouvelle note" */}
      <FAB onClick={openAdd} />

      {/* Bottom sheet ajout / édition */}
      <AddNoteSheet
        open={sheetOpen}
        onClose={closeSheet}
        onSave={saveNote}
        onDelete={editId ? () => deleteNote(editId) : null}
        initial={editId ? notes.find(n => n.id === editId) : null}
      />
    </div>
  )
}

// ───────────── Bloc moyenne générale ─────────────
function HeroAvg({ avg, stats }) {
  const shown = stats.slice(0, 6)
  return (
    <div style={{
      background: 'var(--text)', color: '#F5F3ED',
      borderRadius: 16, padding: '16px 18px', marginBottom: 18,
      display: 'flex', alignItems: 'center', gap: 12,
      boxShadow: '0 4px 14px rgba(0,0,0,.12)',
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, opacity: .6, fontWeight: 500, letterSpacing: .3, textTransform: 'uppercase' }}>
          Moyenne générale
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 2 }}>
          <span style={{ fontFamily: 'Fraunces', fontSize: 34, fontWeight: 700, letterSpacing: -1 }}>
            {avg.toFixed(1).replace('.', ',')}
          </span>
          <span style={{ fontSize: 13, opacity: .6 }}>/20</span>
        </div>
      </div>
      <MiniBars data={shown} />
    </div>
  )
}

function MiniBars({ data }) {
  if (!data.length) return null
  return (
    <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end', height: 36 }}>
      {data.map(s => {
        const h = Math.max(4, (s.avg / 20) * 36)
        return (
          <div key={s.id}
            title={`${s.subj?.name || '?'} — ${s.avg.toFixed(1)}/20`}
            style={{ width: 6, height: h, background: gradeColor(s.avg), borderRadius: 2, opacity: .9 }} />
        )
      })}
    </div>
  )
}

// ───────────── Titre de section ─────────────
function SectionTitle({ children, right }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
      <h3 style={{
        fontFamily: 'Fraunces', fontSize: 17, fontWeight: 700, letterSpacing: -.3,
        margin: 0, color: 'var(--text)',
      }}>
        {children}
      </h3>
      {right}
    </div>
  )
}

// ───────────── Ligne matière ─────────────
function SubjectRow({ stat }) {
  const c = gradeColor(stat.avg)
  return (
    <div className="card" style={{
      padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12,
      borderRadius: 14,
    }}>
      <div style={{
        width: 34, height: 34, borderRadius: 10, flexShrink: 0,
        background: c + '18', color: c,
        fontFamily: 'Fraunces', fontSize: 16, fontWeight: 700,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {stat.subj?.short || '?'}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{stat.subj?.name || '?'}</div>
        <div style={{ fontSize: 11, color: 'var(--muted)' }}>
          {stat.count} note{stat.count > 1 ? 's' : ''} · coef {stat.subj?.coef || 1}
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <span style={{ fontFamily: 'Fraunces', fontSize: 20, fontWeight: 700, color: c, letterSpacing: -.3 }}>
          {stat.avg.toFixed(1).replace('.', ',')}
        </span>
        <span style={{ fontSize: 11, color: 'var(--muted)', marginLeft: 2 }}>/20</span>
      </div>
    </div>
  )
}

// ───────────── Ligne note récente ─────────────
function RecentNote({ note, onEdit }) {
  const c = gradeColor(note.grade)
  const subj = SUBJ_BY_ID[note.subjectId]
  return (
    <button onClick={onEdit} type="button" className="card"
      style={{
        padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12,
        borderRadius: 14, width: '100%', textAlign: 'left', cursor: 'pointer',
        border: 'none',
      }}>
      <div style={{
        width: 32, height: 32, borderRadius: 10, flexShrink: 0,
        background: c + '18', color: c,
        fontFamily: 'Fraunces', fontSize: 15, fontWeight: 700,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {subj?.short || '?'}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 2 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{subj?.name || note.subjectId}</span>
          <span style={{ fontSize: 11, color: 'var(--muted)' }}>· coef {note.coef}</span>
        </div>
        <div style={{ fontSize: 12, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {note.title || note.type} · {fmtShortDate(note.date)}
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <span style={{ fontFamily: 'Fraunces', fontSize: 20, fontWeight: 700, color: c, letterSpacing: -.3 }}>
          {String(note.grade).replace('.', ',')}
        </span>
        <span style={{ fontSize: 11, color: 'var(--muted)', marginLeft: 2 }}>/20</span>
      </div>
    </button>
  )
}

// ───────────── État vide ─────────────
function EmptyState({ onAdd }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '24px 24px 0', textAlign: 'center',
    }}>
      {/* Composition décorative */}
      <div style={{ position: 'relative', width: 200, height: 180, margin: '12px 0 24px' }}>
        <DecoCard label="MATHS"   grade="14/20" color="#5B8DBF" top={10}  left={20}  w={120} rot={-8} />
        <DecoCard label="ANGLAIS" grade="16/20" color="#4ade80" top={52}  right={0}  w={130} rot={6} />
        <DecoCard label="SVT"     grade="15/20" color="#5B8DBF" top={108} left={40}  w={110} rot={-3} />
      </div>

      <h2 style={{
        fontFamily: 'Fraunces', fontSize: 26, fontWeight: 700,
        letterSpacing: -.6, margin: 0, marginBottom: 10, lineHeight: 1.1,
        color: 'var(--text)',
      }}>
        Chaque note raconte ta progression.
      </h2>
      <p style={{
        fontSize: 14, color: 'var(--muted)', margin: 0, lineHeight: 1.5,
        maxWidth: 280,
      }}>
        Ajoute ta première note pour voir tes moyennes, tes tendances et les matières où tu brilles.
      </p>

      <button onClick={onAdd} type="button"
        style={{
          marginTop: 28, background: '#5B8DBF', color: '#fff',
          padding: '14px 28px', borderRadius: 999,
          fontSize: 15, fontWeight: 600, border: 'none', cursor: 'pointer',
          boxShadow: '0 6px 18px rgba(91,141,191,.4)',
          display: 'inline-flex', alignItems: 'center', gap: 8,
          fontFamily: 'DM Sans',
        }}>
        <span style={{ fontSize: 18, fontWeight: 400 }}>+</span>
        Ajouter ma première note
      </button>
    </div>
  )
}

function DecoCard({ label, grade, color, top, left, right, w, rot }) {
  return (
    <div style={{
      position: 'absolute', top, left, right,
      width: w, height: 68,
      background: 'var(--card)',
      borderRadius: 12,
      border: '1px solid rgba(91,141,191,.15)',
      transform: `rotate(${rot}deg)`,
      padding: '10px 12px',
      boxShadow: '0 4px 14px rgba(91,141,191,.12)',
    }}>
      <div style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: .3 }}>{label}</div>
      <div style={{ fontFamily: 'Fraunces', fontSize: 24, fontWeight: 700, color, letterSpacing: -.5 }}>
        {grade}
      </div>
    </div>
  )
}

// ───────────── FAB "Nouvelle note" ─────────────
function FAB({ onClick }) {
  return (
    <button onClick={onClick} type="button"
      style={{
        position: 'fixed', left: '50%', transform: 'translateX(-50%)',
        bottom: 90,
        background: '#5B8DBF', color: '#fff',
        borderRadius: 999, padding: '14px 24px',
        boxShadow: '0 8px 24px rgba(91,141,191,.45)',
        display: 'flex', alignItems: 'center', gap: 10,
        fontSize: 15, fontWeight: 600, border: 'none', cursor: 'pointer',
        zIndex: 30, fontFamily: 'DM Sans',
      }}>
      <span style={{ fontSize: 20, fontWeight: 300, lineHeight: 1 }}>+</span>
      Nouvelle note
    </button>
  )
}

// ───────────── Bottom sheet d'ajout ─────────────
function AddNoteSheet({ open, onClose, onSave, onDelete, initial }) {
  const [subjectId, setSubjectId] = useState(initial?.subjectId || 'math')
  const [gradeStr,  setGradeStr]  = useState(initial ? String(initial.grade).replace('.', ',') : '')
  const [type,      setType]      = useState(initial?.type || 'Contrôle')
  const [coef,      setCoef]      = useState(initial?.coef || 1)
  const [title,     setTitle]     = useState(initial?.title || '')
  const [date,      setDate]      = useState(initial?.date || todayISO())

  // Reset quand la sheet se ré-ouvre avec un nouvel initial
  const [lastInitId, setLastInitId] = useState(null)
  if (open && (initial?.id || null) !== lastInitId) {
    setSubjectId(initial?.subjectId || 'math')
    setGradeStr(initial ? String(initial.grade).replace('.', ',') : '')
    setType(initial?.type || 'Contrôle')
    setCoef(initial?.coef || 1)
    setTitle(initial?.title || '')
    setDate(initial?.date || todayISO())
    setLastInitId(initial?.id || null)
  }

  const press = (k) => {
    haptic(3)
    if (k === '⌫') return setGradeStr(s => s.slice(0, -1))
    if (k === ',') {
      if (gradeStr.includes(',') || gradeStr === '') return
      return setGradeStr(s => s + ',')
    }
    // Chiffres : limiter à 20 max et 1 décimale
    setGradeStr(s => {
      const next = s + k
      const parsed = parseFloat(next.replace(',', '.'))
      if (isNaN(parsed) || parsed > 20) return s
      // Si déjà 1 décimale, bloque
      const [, dec] = next.split(',')
      if (dec && dec.length > 1) return s
      return next
    })
  }

  const parsedGrade = parseFloat(gradeStr.replace(',', '.'))
  const valid = !isNaN(parsedGrade) && parsedGrade >= 0 && parsedGrade <= 20
  const gradeColorNow = valid ? gradeColor(parsedGrade) : '#8891a0'

  const handleSave = () => {
    if (!valid) return
    onSave({
      subjectId, grade: parsedGrade, coef: Math.max(1, coef || 1),
      type, title: title.trim(), date,
    })
  }

  return (
    <BottomSheet open={open} onClose={onClose} title={initial ? 'Modifier la note' : 'Nouvelle note'}>
      {/* Sélecteur matière (chips scrollables) */}
      <div style={{ marginBottom: 14 }}>
        <Label>Matière</Label>
        <div style={{
          display: 'flex', gap: 6, overflowX: 'auto',
          paddingBottom: 4, marginLeft: -4, marginRight: -4, padding: '0 4px 4px',
          scrollbarWidth: 'none',
        }}>
          {SUBJECTS.map(s => {
            const active = s.id === subjectId
            return (
              <button key={s.id} onClick={() => { setSubjectId(s.id); haptic(3) }} type="button"
                style={{
                  flexShrink: 0,
                  padding: '8px 14px', borderRadius: 999,
                  background: active ? '#5B8DBF' : 'rgba(11,18,32,.05)',
                  color: active ? '#fff' : 'var(--text)',
                  border: 'none', cursor: 'pointer',
                  fontSize: 13, fontWeight: 600, fontFamily: 'DM Sans',
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                }}>
                <span style={{
                  width: 18, height: 18, borderRadius: 5,
                  background: active ? 'rgba(255,255,255,.22)' : '#5B8DBF',
                  color: '#fff',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'Fraunces', fontSize: 11, fontWeight: 700,
                }}>{s.short}</span>
                {s.name}
              </button>
            )
          })}
        </div>
      </div>

      {/* Affichage gros de la note */}
      <div style={{
        display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 8,
        padding: '4px 0 12px',
      }}>
        <span style={{
          fontFamily: 'Fraunces', fontSize: 76, fontWeight: 700,
          color: gradeColorNow, letterSpacing: -2, lineHeight: 1,
          minWidth: 80, textAlign: 'right',
        }}>{gradeStr || '—'}</span>
        <span style={{ fontSize: 24, color: 'var(--muted)', fontWeight: 500 }}>/20</span>
      </div>

      {/* Keypad */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 14 }}>
        {['1','2','3','4','5','6','7','8','9',',','0','⌫'].map(k => (
          <button key={k} onClick={() => press(k)} type="button"
            style={{
              padding: '14px 0', textAlign: 'center',
              background: k === '⌫' ? 'transparent' : 'var(--card)',
              border: '1px solid rgba(11,18,32,.06)',
              borderRadius: 12,
              fontFamily: 'Fraunces', fontSize: 22, fontWeight: 600,
              color: k === '⌫' ? 'var(--muted)' : 'var(--text)',
              cursor: 'pointer', letterSpacing: -.3,
            }}>
            {k}
          </button>
        ))}
      </div>

      {/* Type + coef */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <div style={{
          flex: 1, display: 'flex', gap: 4,
          background: 'rgba(11,18,32,.05)', borderRadius: 10, padding: 3,
        }}>
          {TYPES.map(t => {
            const active = type === t
            return (
              <button key={t} onClick={() => { setType(t); haptic(3) }} type="button"
                style={{
                  flex: 1, textAlign: 'center', padding: '8px 0',
                  borderRadius: 8, fontSize: 12, fontWeight: 600,
                  background: active ? 'var(--card)' : 'transparent',
                  color: active ? 'var(--text)' : 'var(--muted)',
                  boxShadow: active ? '0 1px 2px rgba(0,0,0,.08)' : 'none',
                  border: 'none', cursor: 'pointer', fontFamily: 'DM Sans',
                }}>
                {t}
              </button>
            )
          })}
        </div>
        <div style={{
          padding: '6px 10px', borderRadius: 10,
          background: 'rgba(11,18,32,.05)',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <span style={{ color: 'var(--muted)', fontSize: 11, fontWeight: 600 }}>coef</span>
          <input
            type="number" min={1} max={10} value={coef}
            onChange={e => setCoef(Math.max(1, Math.min(10, +e.target.value || 1)))}
            style={{
              width: 36, fontFamily: 'Fraunces', fontSize: 18, fontWeight: 700,
              background: 'transparent', border: 'none', color: 'var(--text)',
              padding: 0, textAlign: 'center',
            }} />
        </div>
      </div>

      {/* Titre + date */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px', gap: 8, marginBottom: 16 }}>
        <input
          value={title} onChange={e => setTitle(e.target.value)}
          placeholder="Intitulé (ex: Contrôle ch. 6)"
          style={{ fontSize: 14 }} />
        <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ fontSize: 14 }} />
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={handleSave} disabled={!valid} type="button"
          style={{
            flex: 1, background: valid ? '#5B8DBF' : 'rgba(91,141,191,.3)',
            color: '#fff', borderRadius: 14, padding: '14px 0',
            fontSize: 15, fontWeight: 700, border: 'none',
            cursor: valid ? 'pointer' : 'not-allowed',
            fontFamily: 'DM Sans',
            boxShadow: valid ? '0 4px 14px rgba(91,141,191,.35)' : 'none',
          }}>
          {initial ? 'Enregistrer' : 'Ajouter la note'}
        </button>
        {onDelete && (
          <button onClick={onDelete} type="button"
            style={{
              background: 'transparent', color: '#f87171',
              border: '1px solid rgba(248,113,113,.35)', borderRadius: 14,
              padding: '14px 18px', fontSize: 14, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'DM Sans',
            }}>
            Supprimer
          </button>
        )}
      </div>
    </BottomSheet>
  )
}

function Label({ children }) {
  return (
    <p style={{
      fontSize: 11, color: 'var(--muted)',
      textTransform: 'uppercase', letterSpacing: .8,
      marginBottom: 6, fontWeight: 600,
    }}>{children}</p>
  )
}
