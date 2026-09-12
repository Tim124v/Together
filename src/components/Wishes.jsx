import { useMemo, useState } from 'react'
import { FiCalendar, FiMinus, FiPlus } from 'react-icons/fi'
import { HiOutlineSparkles } from 'react-icons/hi2'
import { useApp } from '../context/AppContext'
import { wishCategories } from '../data/mockData'
import { PRIORITY, cx, formatDate, ownerStyle, plural, relativeDate } from '../utils/helpers'
import Avatar from './shared/Avatar'
import Button from './shared/Button'
import Card from './shared/Card'
import ProgressBar from './shared/ProgressBar'

function WishCard({ wish }) {
  const { updateWishProgress, users } = useApp()
  const style = ownerStyle(wish.assigned)
  const priority = PRIORITY[wish.priority]

  const step = (delta) => updateWishProgress(wish.id, Math.min(100, Math.max(0, wish.progress + delta)))

  return (
    <Card hover padding="p-4" className="relative overflow-hidden">
      <div className={cx('absolute -right-12 -top-14 h-24 w-24 rounded-full opacity-[0.14] blur-2xl', style.gradient)} />

      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-extrabold leading-snug tracking-tight">{wish.title}</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{wish.description}</p>
          </div>
          <span className={cx('chip shrink-0 px-2 py-1 text-[10px]', priority.className)}>{priority.label}</span>
        </div>

        <div className="mt-3.5 flex flex-wrap items-center gap-2">
          <span className="chip bg-slate-100 px-2 py-1 text-[11px] text-slate-500 dark:bg-white/[0.07] dark:text-slate-400">
            <FiCalendar className="text-[10px]" /> {formatDate(wish.dueDate)}
          </span>
          <span className={cx('chip px-2 py-1 text-[11px]', style.bg, style.text)}>
            <Avatar owner={wish.assigned} size="xs" ring={false} className="!h-4 !w-4 !text-[8px]" />
            {users[wish.assigned].name}
          </span>
          <span className="ml-auto text-[11px] font-semibold text-slate-400">{relativeDate(wish.dueDate)}</span>
        </div>

        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Прогресс</span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => step(-10)}
                aria-label="Убавить прогресс"
                className="grid h-6 w-6 place-items-center rounded-lg bg-slate-100 text-slate-500 transition hover:bg-slate-200 dark:bg-white/[0.07] dark:text-slate-300"
              >
                <FiMinus className="text-[11px]" />
              </button>
              <span className="w-9 text-center text-xs font-extrabold tabular-nums">{wish.progress}%</span>
              <button
                type="button"
                onClick={() => step(10)}
                aria-label="Добавить прогресс"
                className={cx('grid h-6 w-6 place-items-center rounded-lg text-white transition hover:brightness-110', style.solid)}
              >
                <FiPlus className="text-[11px]" />
              </button>
            </div>
          </div>
          <ProgressBar value={wish.progress} owner={wish.assigned} />
        </div>
      </div>
    </Card>
  )
}

export default function Wishes() {
  const { wishes, openModal } = useApp()
  const [category, setCategory] = useState('all')

  const filtered = useMemo(
    () => (category === 'all' ? wishes : wishes.filter((w) => w.category === category)),
    [wishes, category],
  )

  const grouped = useMemo(() => {
    return wishCategories
      .map((cat) => ({ ...cat, items: filtered.filter((w) => w.category === cat.id) }))
      .filter((cat) => cat.items.length > 0)
  }, [filtered])

  const avgProgress = wishes.length
    ? Math.round(wishes.reduce((sum, w) => sum + w.progress, 0) / wishes.length)
    : 0

  return (
    <div className="page-enter space-y-5">
      <Card className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">Общие мечты</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {wishes.length} {plural(wishes.length, ['желание', 'желания', 'желаний'])} · средний прогресс {avgProgress}%
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex flex-wrap gap-1 rounded-xl bg-slate-100/80 p-1 dark:bg-white/[0.06]">
            <button
              type="button"
              onClick={() => setCategory('all')}
              className={cx(
                'flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-bold transition',
                category === 'all'
                  ? 'bg-white text-brand-600 shadow-soft dark:bg-white/12 dark:text-white'
                  : 'text-slate-500 hover:text-ink dark:text-slate-400 dark:hover:text-white',
              )}
            >
              ✨ Все
            </button>
            {wishCategories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id)}
                className={cx(
                  'flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-bold transition',
                  category === cat.id
                    ? 'bg-white text-brand-600 shadow-soft dark:bg-white/12 dark:text-white'
                    : 'text-slate-500 hover:text-ink dark:text-slate-400 dark:hover:text-white',
                )}
              >
                <span>{cat.emoji}</span>
                <span className="hidden sm:inline">{cat.label}</span>
              </button>
            ))}
          </div>
          <Button icon={FiPlus} onClick={() => openModal('wish')}>
            Добавить желание
          </Button>
        </div>
      </Card>

      {grouped.map((cat) => (
        <section key={cat.id} className="space-y-3">
          <div className="flex items-center gap-3 px-1">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white text-lg shadow-soft dark:bg-white/[0.06]">
              {cat.emoji}
            </span>
            <div>
              <h2 className="text-base font-extrabold tracking-tight">{cat.label}</h2>
              <p className="text-[11px] text-slate-400">
                {cat.items.length} {plural(cat.items.length, ['желание', 'желания', 'желаний'])} в категории
              </p>
            </div>
            <span className="ml-auto hidden text-[11px] font-bold text-slate-400 sm:block">
              средний прогресс{' '}
              {Math.round(cat.items.reduce((s, w) => s + w.progress, 0) / cat.items.length)}%
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {cat.items.map((wish) => (
              <WishCard key={wish.id} wish={wish} />
            ))}
          </div>
        </section>
      ))}

      {grouped.length === 0 && (
        <Card className="grid place-items-center py-16 text-center">
          <HiOutlineSparkles className="text-3xl text-brand-400" />
          <p className="mt-3 text-base font-bold tracking-tight">Здесь пока пусто</p>
          <p className="mt-1 max-w-xs text-sm text-slate-500 dark:text-slate-400">
            Добавьте первое желание в эту категорию — и начните двигаться к нему вместе
          </p>
          <Button icon={FiPlus} className="mt-4" onClick={() => openModal('wish')}>
            Добавить желание
          </Button>
        </Card>
      )}
    </div>
  )
}
