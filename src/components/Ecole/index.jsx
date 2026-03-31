import { useState } from 'react'
import EmploiDuTemps from './EmploiDuTemps'
import DevoirsExamens from './DevoirsExamens'

export default function Ecole({ courses, setCourses, devoirs, setDevoirs, examens, setExamens, tasks, setTasks }) {
  const [sub, setSub] = useState('emploi')
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800 }}>📚 École</h1>
        <div className="subtab-bar">
          <button className={`subtab${sub === 'emploi' ? ' active' : ''}`} onClick={() => setSub('emploi')}>📅 Emploi du temps</button>
          <button className={`subtab${sub === 'devoirs' ? ' active' : ''}`} onClick={() => setSub('devoirs')}>📝 Devoirs & Examens</button>
        </div>
      </div>
      {sub === 'emploi'
        ? <EmploiDuTemps courses={courses} setCourses={setCourses} />
        : <DevoirsExamens devoirs={devoirs} setDevoirs={setDevoirs} examens={examens} setExamens={setExamens} tasks={tasks} setTasks={setTasks} />}
    </div>
  )
}
