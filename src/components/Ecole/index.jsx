import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import EmploiDuTemps from './EmploiDuTemps'
import DevoirsExamens from './DevoirsExamens'
import Notes from './Notes'
import TextImport from '../shared/TextImport'
import PageHeader from '../shared/PageHeader'

export default function Ecole() {
  const { courses, setCourses, devoirs, setDevoirs, examens, setExamens, tasks, setTasks, apiKey } = useApp()
  const [sub, setSub] = useState('emploi')
  const [showImport, setShowImport] = useState(false)

  const handleImport = ({ taches, devoirs: newDevoirs, examens: newExamens }) => {
    if (taches.length > 0 && setTasks) setTasks(p => [...p, ...taches])
    if (newDevoirs.length > 0) setDevoirs(p => [...p, ...newDevoirs])
    if (newExamens.length > 0) setExamens(p => [...p, ...newExamens])
  }

  return (
    <div>
      <PageHeader title="École" sub="Emploi du temps, devoirs, examens"
        action={
          <button className="btn-ghost" onClick={() => setShowImport(true)}
            style={{ fontSize: 12, padding: '7px 13px', border: '1px solid rgba(91,141,191,.3)' }}>
            📋 Import IA
          </button>
        } />
      <div className="subtab-bar" style={{ marginBottom: 20, flexWrap: 'wrap' }}>
        <button className={`subtab${sub === 'emploi' ? ' active' : ''}`} onClick={() => setSub('emploi')}>📅 Emploi du temps</button>
        <button className={`subtab${sub === 'devoirs' ? ' active' : ''}`} onClick={() => setSub('devoirs')}>📝 Devoirs & Examens</button>
        <button className={`subtab${sub === 'notes' ? ' active' : ''}`} onClick={() => setSub('notes')}>📊 Notes</button>
      </div>
      {sub === 'emploi' && <EmploiDuTemps />}
      {sub === 'devoirs' && <DevoirsExamens />}
      {sub === 'notes' && <Notes />}

      {showImport && (
        <TextImport apiKey={apiKey} onImport={handleImport} onClose={() => setShowImport(false)} />
      )}
    </div>
  )
}
