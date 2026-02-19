interface Props {
  label: string
  value: string
}

export default function StatPill({ label, value }: Props) {
  return (
    <div className="stat-pill">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}
