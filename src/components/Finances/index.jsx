import { useState } from 'react'
import Depenses from './Depenses'
import Abonnements from './Abonnements'

export default function Finances({ expenses, setExpenses, subscriptions, setSubscriptions }) {
  const [sub, setSub] = useState('depenses')
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800 }}>💰 Finances</h1>
        <div className="subtab-bar">
          <button className={`subtab${sub === 'depenses' ? ' active' : ''}`} onClick={() => setSub('depenses')}>💸 Dépenses</button>
          <button className={`subtab${sub === 'abonnements' ? ' active' : ''}`} onClick={() => setSub('abonnements')}>🔄 Abonnements</button>
        </div>
      </div>
      {sub === 'depenses'
        ? <Depenses expenses={expenses} setExpenses={setExpenses} />
        : <Abonnements subscriptions={subscriptions} setSubscriptions={setSubscriptions} />}
    </div>
  )
}
