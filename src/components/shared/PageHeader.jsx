export default function PageHeader({ title, sub, action }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
      <div>
        <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0 }}>{title}</h1>
        {sub && <p style={{ color: 'var(--muted)', fontSize: 14, margin: '4px 0 0' }}>{sub}</p>}
      </div>
      {action}
    </div>
  )
}
