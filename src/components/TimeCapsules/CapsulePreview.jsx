import { FiCopy, FiLock, FiTrash2, FiUnlock } from 'react-icons/fi'
import Button from '../shared/Button'
import Card from '../shared/Card'
import { formatDate, todayISO } from '../../utils/helpers'

export default function CapsulePreview({
  capsule,
  loading,
  onOpen,
  onDelete,
  onShare,
}) {
  if (!capsule) {
    return (
      <Card className="grid min-h-[320px] place-items-center text-center">
        <div>
          <p className="text-4xl">📦</p>
          <p className="mt-3 text-sm font-bold">Выберите капсулу</p>
          <p className="mt-1 text-xs text-slate-500">Слева список писем и сюрпризов, которые вы оставили друг другу.</p>
        </div>
      </Card>
    )
  }

  const isToday = capsule.openDate === todayISO()
  const celebrate = capsule.status === 'ready' && isToday
  const images = capsule.content?.images || []
  const tags = capsule.content?.tags || []

  return (
    <Card className="relative overflow-hidden">
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[#667eea]/20 blur-3xl" />
      <div className="relative">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-[#667eea]">Капсула времени</p>
            <h2 className="mt-1 text-xl font-extrabold tracking-tight">{capsule.title}</h2>
            <p className="mt-1 text-xs text-slate-500">
              {capsule.createdByName || 'Автор'} · {formatDate(capsule.createdDate)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {capsule.canOpen && (
              <Button size="sm" onClick={() => onOpen(capsule)}>
                {celebrate ? '🎉 Открыть сегодня' : 'Открыть капсулу'}
              </Button>
            )}
            {!capsule.locked && (
              <Button size="sm" variant="outline" icon={FiCopy} onClick={() => onShare(capsule)}>
                Поделиться
              </Button>
            )}
            {capsule.isAuthor && (
              <Button size="sm" variant="danger" icon={FiTrash2} onClick={() => onDelete(capsule)}>
                Удалить
              </Button>
            )}
          </div>
        </div>

        {capsule.locked ? (
          <div className="surface-muted mt-6 px-5 py-10 text-center">
            <FiLock className="mx-auto text-2xl text-[#667eea]" />
            <p className="mt-3 text-sm font-bold">Капсула закрыта</p>
            <p className="mt-1 text-xs text-slate-500">
              Откроется {formatDate(capsule.openDate)}. До тех пор содержимое скрыто даже от автора.
            </p>
          </div>
        ) : loading ? (
          <p className="mt-8 text-sm text-slate-500">Загружаем содержимое…</p>
        ) : (
          <div className="mt-6 space-y-5">
            {isToday && (
              <p className="rounded-2xl bg-amber-400/15 px-4 py-3 text-sm font-bold text-amber-600 dark:text-amber-300">
                🎉 Сегодня день открытия этой капсулы
              </p>
            )}
            {images.length > 0 && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {images.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt=""
                    className="h-36 w-full rounded-2xl object-cover shadow-soft"
                  />
                ))}
              </div>
            )}
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              {capsule.content?.text || capsule.description || 'Пустая капсула'}
            </p>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span key={tag} className="chip bg-[#667eea]/10 text-[#667eea]">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
            <p className="flex items-center gap-2 text-[11px] text-slate-400">
              <FiUnlock /> Открыто {capsule.openedAt ? formatDate(String(capsule.openedAt).slice(0, 10)) : 'сразу'}
            </p>
          </div>
        )}
      </div>
    </Card>
  )
}
