import CapsuleCard from './CapsuleCard'

export default function CapsuleList({ capsules, selectedId, onSelect }) {
  if (!capsules.length) {
    return (
      <div className="surface-muted px-4 py-10 text-center text-sm text-slate-500">
        Пока нет капсул. Создайте первую — письмо себе из сегодняшнего дня.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {capsules.map((capsule) => (
        <CapsuleCard
          key={capsule.id}
          capsule={capsule}
          active={capsule.id === selectedId}
          onSelect={onSelect}
        />
      ))}
    </div>
  )
}
