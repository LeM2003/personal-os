import { useState } from 'react'
import { Wallet, Repeat, HandCoins, PiggyBank } from 'lucide-react'
import Depenses from './Depenses'
import Abonnements from './Abonnements'
import Dettes from './Dettes'
import Epargne from './Epargne'

export default function Finances() {
  const [sub, setSub] = useState('depenses')

  const tabs = [
    { id: 'depenses',    label: 'Dépenses',    icon: Wallet },
    { id: 'abonnements', label: 'Abonnements', icon: Repeat },
    { id: 'dettes',      label: 'Dettes',      icon: HandCoins },
    { id: 'epargne',     label: 'Épargne',     icon: PiggyBank },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <h1 style={{ fontSize: 26, fontWeight: 600 }}>Finances</h1>
        <div className="subtab-bar" style={{ flexWrap: 'wrap' }}>
          {tabs.map(t => {
            const Icon = t.icon
            return (
              <button
                key={t.id}
                className={`subtab${sub === t.id ? ' active' : ''}`}
                onClick={() => setSub(t.id)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <Icon size={14} /> {t.label}
              </button>
            )
          })}
        </div>
      </div>
      {sub === 'depenses'    && <Depenses />}
      {sub === 'abonnements' && <Abonnements />}
      {sub === 'dettes'      && <Dettes />}
      {sub === 'epargne'     && <Epargne />}
    </div>
  )
}
