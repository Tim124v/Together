import { useMemo, useState } from 'react'
import { FiCheck, FiClock, FiMove, FiPlus, FiTrash2 } from 'react-icons/fi'
import { useApp } from '../context/AppContext'
import { taskColumns } from '../data/mockData'
import { cx, ownerStyle, relativeDate, todayISO } from '../utils/helpers'
import Avatar from './shared/Avatar'
import Button from './shared/Button'
import Card from './shared/Card'

const FILTERS = [
  { id: 'all', label: 'Все', emoji: '🌐' },
  { id: 'he', label: 'Мне', emoji: '🧑‍💻' },
  { id: 'she', label: 'Ей', emoji: '💃' },
  { id: 'both', label: 'Общее', emoji: '💞' },
]

function TaskCard({ task, onDragStart, onDragEnd, dragging }) {
  const { toggleTask, removeTask, users } = useApp()
  const style = ownerStyle(task.assigned)
  const done = task.status === 'done'
  const overdue = !done && task.dueDate < todayISO()

  return (
    <article
      draggable
      onDragStart={(e) => onDragStart(e, task)}
      onDragEnd={onDragEnd}
      className={cx(
        'group relative cursor-grab overflow-hidden rounded-2xl border bg-white p-3.5 shadow-soft transition-all duration-200',
        'hover:-translate-y-0.5 hover:shadow-lift active:cursor-grabbing',
        'dark:bg-white/[0.05]',
        done ? 'border-slate-200/70 dark:border-white/8' : cx(style.border, 'border-l-[3px]'),
        dragging && 'dragging',
      )}
    >
      <span className={cx('absolute inset-y-0 left-0 w-[3px]', style.solid, done && 'opacity-30')} />

      <div className="flex items-start gap-2.5">
        <button
          type="button"
          onClick={() => toggleTask(task.id)}
          aria-label="Завершено"
          className={cx(
            'mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border-2 transition-all duration-200',
            done
              ? cx(style.solid, 'border-transparent text-white')
              : 'border-slate-300 hover:border-brand dark:border-slate-600',
          )}
        >
          {done && <FiCheck className="text-[11px]" strokeWidth={3} />}
        </button>

        <div className="min-w-0 flex-1">
          <p
            className={cx(
              'text-sm font-bold leading-snug tracking-tight transition',
              done && 'text-slate-400 line-through dark:text-slate-500',
            )}
          >
            {task.title}
          </p>
          {task.note && <p className="mt-1 text-[11px] text-slate-400">{task.note}</p>}
        </div>

        <div className="flex shrink-0 items-center gap-1 opacity-0 transition group-hover:opacity-100">
          <FiMove className="text-xs text-slate-300" />
          <button
            type="button"
            onClick={() => removeTask(task.id)}
            aria-label="Удалить"
            className="grid h-6 w-6 place-items-center rounded-lg text-slate-300 transition hover:bg-rose-500/10 hover:text-rose-500"
          >
            <FiTrash2 className="text-xs" />
          </button>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 pl-[30px]">
        <span
          className={cx(
            'chip px-2 py-1 text-[11px]',
            overdue ? 'bg-rose-500/12 text-rose-500' : 'bg-slate-100 text-slate-500 dark:bg-white/[0.07] dark:text-slate-400',
          )}
        >
          <FiClock className="text-[10px]" />
          {relativeDate(task.dueDate)}
        </span>
        <span className="flex items-center gap-1.5">
          <span className={cx('text-[11px] font-bold', style.text)}>{users[task.assigned].name}</span>
          <Avatar owner={task.assigned} size="xs" ring={false} />
        </span>
      </div>
    </article>
  )
}

function Column({ column, tasks, dragId, onDragStart, onDragEnd, onDrop }) {
  const [over, setOver] = useState(false)
  const { openModal } = useApp()

  const accent = {
    todo: 'bg-brand',
    'in-progress': 'bg-him',
    done: 'bg-both',
  }[column.id]

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        setOver(true)
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault()
        setOver(false)
        onDrop(column.id)
      }}
      className={cx(
        'flex min-h-[280px] flex-col rounded-3xl border p-3.5 transition-all duration-200',
        over
          ? 'border-brand/60 bg-brand/6 shadow-glow dark:bg-brand/12'
          : 'border-slate-200/70 bg-white/50 dark:border-white/8 dark:bg-white/[0.02]',
      )}
    >
      <div className="mb-3.5 flex items-center gap-2.5 px-1">
        <span className={cx('h-2.5 w-2.5 rounded-full', accent)} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-extrabold tracking-tight">{column.label}</p>
          <p className="truncate text-[11px] text-slate-400">{column.hint}</p>
        </div>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold tabular-nums text-slate-500 dark:bg-white/10 dark:text-slate-300">
          {tasks.length}
        </span>
      </div>

      <div className="flex-1 space-y-2.5">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            dragging={dragId === task.id}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
          />
        ))}

        {tasks.length === 0 && (
          <div className="grid place-items-center rounded-2xl border-2 border-dashed border-slate-200 py-10 text-center dark:border-white/10">
            <p className="text-xs font-semibold text-slate-400">Перетащите задачу сюда</p>
          </div>
        )}
      </div>

      {column.id === 'todo' && (
        <button
          type="button"
          onClick={() => openModal('task')}
          className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 py-2.5 text-xs font-bold text-slate-400 transition hover:border-brand/50 hover:text-brand-500 dark:border-white/10"
        >
          <FiPlus /> Добавить задачу
        </button>
      )}
    </div>
  )
}

export default function TaskBoard() {
  const { tasks, moveTask, openModal } = useApp()
  const [filter, setFilter] = useState('all')
  const [dragId, setDragId] = useState(null)

  const filtered = useMemo(
    () => (filter === 'all' ? tasks : tasks.filter((t) => t.assigned === filter)),
    [tasks, filter],
  )

  const handleDragStart = (e, task) => {
    setDragId(task.id)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(task.id))
  }

  const handleDrop = (status) => {
    if (dragId != null) moveTask(dragId, status)
    setDragId(null)
  }

  const doneCount = tasks.filter((t) => t.status === 'done').length

  return (
    <div className="page-enter space-y-5">
      <Card className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">Общие задачи</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Перетаскивайте карточки между колонками · выполнено {doneCount} из {tasks.length}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex gap-1 rounded-xl bg-slate-100/80 p-1 dark:bg-white/[0.06]">
            {FILTERS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setFilter(item.id)}
                className={cx(
                  'flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-bold transition-all duration-200',
                  filter === item.id
                    ? 'bg-white text-brand-600 shadow-soft dark:bg-white/12 dark:text-white'
                    : 'text-slate-500 hover:text-ink dark:text-slate-400 dark:hover:text-white',
                )}
              >
                <span>{item.emoji}</span>
                {item.label}
              </button>
            ))}
          </div>
          <Button icon={FiPlus} onClick={() => openModal('task')}>
            Добавить задачу
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {taskColumns.map((column) => (
          <Column
            key={column.id}
            column={column}
            tasks={filtered.filter((t) => t.status === column.id)}
            dragId={dragId}
            onDragStart={handleDragStart}
            onDragEnd={() => setDragId(null)}
            onDrop={handleDrop}
          />
        ))}
      </div>
    </div>
  )
}
