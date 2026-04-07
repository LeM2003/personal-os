export default function EmptyState({ icon, msg, sub }) {
  return (
    <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--muted)' }}>
      <div style={{ fontSize: 42, marginBottom: 10 }}>{icon}</div>
      <p style={{ fontSize: 15, margin: 0, color: 'var(--muted)' }}>{msg}</p>
      {sub && <p style={{ fontSize: 13, margin: '6px 0 0' }}>{sub}</p>}
    </div>
  )
}
