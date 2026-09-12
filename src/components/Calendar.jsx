import { useMemo, useState } from 'react'
import { FiChevronLeft, FiChevronRight, FiClock, FiMapPin, FiPlus } from 'react-icons/fi'
import { useApp } from '../context/AppContext'
import {
  MONTHS_NOM,
  WEEKDAYS,
  buildMonthGrid,
  cx,
  formatDate,
  formatEventLine,
  ownerStyle,
  plural,
  relativeDate,
  todayISO,
} from '../utils/helpers'
import Avatar from './shared/Avatar'
import Button from './shared/Button'
import Card, { CardHeader } from './shared/Card'

const LEGEND = [
  { owner: 'he', text: 'События Артёма' },
  { owner: 'she', text: 'События Кати' },
  { owner: 'both', text: 'Вместе' },
]

export default function Calendar() {
  const { events, openModal, users } = useApp()
  const today = todayISO()
  const [cursor, setCursor] = useState(() => {
    const now = new Date()
    return { year: now.getFullYear(), month: now.getMonth() }
  })
  const [selected, setSelected] = useState(today)

  const grid = useMemo(() => buildMonthGrid(cursor.year, cursor.month), [cursor])

  const byDate = useMemo(() => {
    return events.reduce((acc, event) => {
      acc[event.date] = [...(acc[event.date] ?? []), event]
      return acc
    }, {})
  }, [events])

  const selectedEvents = byDate[selected] ?? []

  const monthEvents = useMemo(
    () =>
      events
        .filter((e) => e.date.startsWith(`${cursor.year}-${String(cursor.month + 1).padStart(2, '0')}`))
        .sort((a, b) => a.date.localeCompare(b.date)),
    [events, cursor],
  )

  const shiftMonth = (delta) => {
    setCursor((prev) => {
      const d = new Date(prev.year, prev.month + delta, 1)
      return { year: d.getFullYear(), month: d.getMonth() }
    })
  }

  return (
    <div className="page-enter space-y-5">
      <Card className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">Общий календарь</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {monthEvents.length} событий в этом месяце · нажмите на день, чтобы увидеть детали
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1 rounded-xl bg-slate-100/80 p-1 dark:bg-white/[0.06]">
            <button
              type="button"
              onClick={() => shiftMonth(-1)}
              aria-label="Предыдущий месяц"
              className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 transition hover:bg-white hover:text-brand-600 dark:hover:bg-white/10 dark:hover:text-white"
            >
              <FiChevronLeft />
            </button>
            <span className="min-w-[136px] text-center text-sm font-bold tracking-tight">
              {MONTHS_NOM[cursor.month]} {cursor.year}
            </span>
            <button
              type="button"
              onClick={() => shiftMonth(1)}
              aria-label="Следующий месяц"
              className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 transition hover:bg-white hover:text-brand-600 dark:hover:bg-white/10 dark:hover:text-white"
            >
              <FiChevronRight />
            </button>
          </div>
          <Button icon={FiPlus} onClick={() => openModal('event')}>
            Добавить событие
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Card padding="p-4 sm:p-5">
          <div className="mb-2 grid grid-cols-7 gap-1.5">
            {WEEKDAYS.map((day) => (
              <div
                key={day}
                className="py-1.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-400"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {grid.map((iso, index) => {
              if (!iso) return <div key={`empty-${index}`} className="min-h-[86px] rounded-2xl" />

              const dayEvents = byDate[iso] ?? []
              const hasShared = dayEvents.some((e) => e.participants === 'both')
              const isToday = iso === today
              const isSelected = iso === selected

              return (
                <button
                  key={iso}
                  type="button"
                  onClick={() => setSelected(iso)}
                  className={cx(
                    'relative flex min-h-[86px] flex-col gap-1 overflow-hidden rounded-2xl border p-2 text-left transition-all duration-200',
                    isSelected
                      ? 'border-brand bg-brand/8 shadow-glow dark:bg-brand/16'
                      : 'border-slate-200/70 bg-white/60 hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-soft dark:border-white/8 dark:bg-white/[0.03]',
                  )}
                >
                  {/* Тёмная полоса для дней с совместными событиями */}
                  {hasShared && <span className="absolute inset-x-0 top-0 h-1.5 bg-grad-night" />}

                  <span
                    className={cx(
                      'grid h-6 w-6 place-items-center rounded-lg text-xs font-bold tabular-nums',
                      isToday
                        ? 'bg-grad-brand text-white shadow-soft'
                        : 'text-slate-500 dark:text-slate-300',
                      hasShared && 'mt-1',
                    )}
                  >
                    {Number(iso.slice(-2))}
                  </span>

                  <span className="space-y-1">
                    {dayEvents.slice(0, 2).map((event) => {
                      const style = ownerStyle(event.participants)
                      return (
                        <span
                          key={event.id}
                          className={cx(
                            'flex items-center gap-1 rounded-md px-1.5 py-[3px] text-[10px] font-semibold leading-tight',
                            style.bg,
                            style.text,
                          )}
                        >
                          <span className={cx('h-1.5 w-1.5 shrink-0 rounded-full', style.dot)} />
                          <span className="truncate">{event.title}</span>
                        </span>
                      )
                    })}
                    {dayEvents.length > 2 && (
                      <span className="block pl-1 text-[10px] font-bold text-slate-400">
                        +{dayEvents.length - 2}
                      </span>
                    )}
                  </span>
                </button>
              )
            })}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-slate-100 pt-4 dark:border-white/8">
            {LEGEND.map((item) => (
              <span key={item.owner} className="flex items-center gap-2 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                <span className={cx('h-2.5 w-2.5 rounded-full', ownerStyle(item.owner).solid)} />
                {item.text}
              </span>
            ))}
            <span className="flex items-center gap-2 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              <span className="h-2.5 w-5 rounded-full bg-grad-night" />
              Совместный день
            </span>
          </div>
        </Card>

        <div className="space-y-5">
          <Card>
            <CardHeader
              title={formatDate(selected)}
              subtitle={`${relativeDate(selected)} · ${selectedEvents.length} ${plural(selectedEvents.length, ['событие', 'события', 'событий'])}`}
              icon={FiClock}
            />

            {selectedEvents.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-slate-200 px-4 py-8 text-center dark:border-white/10">
                <p className="text-2xl">🌤️</p>
                <p className="mt-2 text-sm font-bold tracking-tight">Свободный день</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Отличный повод придумать что-нибудь вдвоём
                </p>
                <Button size="sm" variant="soft" icon={FiPlus} className="mt-3.5" onClick={() => openModal('event')}>
                  Запланировать
                </Button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {selectedEvents.map((event) => {
                  const style = ownerStyle(event.participants)
                  return (
                    <div
                      key={event.id}
                      className={cx(
                        'flex gap-3 rounded-2xl border-l-[3px] bg-slate-50/80 p-3.5 transition hover:shadow-soft dark:bg-white/[0.04]',
                        style.border,
                      )}
                    >
                      <Avatar owner={event.participants} size="sm" ring={false} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold leading-snug tracking-tight">
                          {formatEventLine(event, users)}
                        </p>
                        <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            <FiClock className="text-[10px]" /> {event.time}
                          </span>
                          <span className="flex items-center gap-1">
                            <FiMapPin className="text-[10px]" /> {event.place}
                          </span>
                        </p>
                        <span className={cx('chip mt-2 px-2 py-0.5 text-[10px]', style.bg, style.text)}>
                          {users[event.participants].name}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </Card>

          <Card>
            <CardHeader title="Дальше в этом месяце" subtitle="Хронология событий" />
            <div className="max-h-[300px] space-y-1 overflow-y-auto pr-1">
              {monthEvents.map((event) => {
                const style = ownerStyle(event.participants)
                return (
                  <button
                    key={event.id}
                    type="button"
                    onClick={() => setSelected(event.date)}
                    className={cx(
                      'flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition',
                      event.date === selected
                        ? 'bg-brand/8 dark:bg-brand/14'
                        : 'hover:bg-slate-50 dark:hover:bg-white/[0.04]',
                    )}
                  >
                    <span className="w-12 shrink-0 text-[11px] font-bold tabular-nums text-slate-400">
                      {formatDate(event.date).replace(/ \d{4}$/, '').slice(0, 6)}
                    </span>
                    <span className={cx('h-1.5 w-1.5 shrink-0 rounded-full', style.dot)} />
                    <span className="min-w-0 flex-1 truncate text-xs font-semibold">{event.title}</span>
                    <span className={cx('shrink-0 text-[10px] font-bold', style.text)}>
                      {event.participants === 'both' ? 'Вы оба' : users[event.participants].name}
                    </span>
                  </button>
                )
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
