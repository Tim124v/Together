import {
  FiArrowUpRight,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiHeart,
  FiPlus,
  FiTarget,
  FiTrendingUp,
} from 'react-icons/fi'
import { HiOutlineSparkles } from 'react-icons/hi2'
import { useApp } from '../context/AppContext'
import { cx, formatDate, ownerStyle, plural, relativeDate, todayISO } from '../utils/helpers'
import Avatar, { AvatarPair } from './shared/Avatar'
import Button from './shared/Button'
import Card, { CardHeader } from './shared/Card'
import ProgressBar from './shared/ProgressBar'

const ACTIVITY_ICONS = {
  check: FiCheckCircle,
  calendar: FiCalendar,
  heart: FiHeart,
  task: FiTarget,
  star: HiOutlineSparkles,
}

function MetricCard({ label, value, caption, icon: Icon, gradient, trend }) {
  return (
    <Card hover className="relative overflow-hidden">
      <div className={cx('absolute -right-8 -top-10 h-28 w-28 rounded-full opacity-15 blur-2xl', gradient)} />
      <div className="relative">
        <div className="flex items-start justify-between">
          <span className={cx('grid h-11 w-11 place-items-center rounded-2xl text-white shadow-soft', gradient)}>
            <Icon className="text-lg" />
          </span>
          {trend && (
            <span className="chip bg-both/12 text-both">
              <FiTrendingUp className="text-[11px]" />
              {trend}
            </span>
          )}
        </div>
        <p className="mt-4 text-[32px] font-extrabold leading-none tracking-tight tabular-nums">{value}</p>
        <p className="mt-1.5 text-sm font-bold tracking-tight">{label}</p>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{caption}</p>
      </div>
    </Card>
  )
}

function HeroBanner() {
  const { stats, openModal, anniversaries } = useApp()
  const upcoming = [...anniversaries].sort((a, b) => a.date.localeCompare(b.date))
  const nearest = upcoming.find((item) => item.date >= todayISO()) ?? upcoming[0]

  return (
    <Card className="relative overflow-hidden border-none bg-grad-brand p-6 text-white shadow-lift sm:p-8">
      <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/15 blur-3xl" />
      <div className="absolute -bottom-24 left-10 h-56 w-56 rounded-full bg-her/40 blur-3xl" />
      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-lg">
          <span className="chip bg-white/20 text-white backdrop-blur">
            <HiOutlineSparkles /> Ваш день вдвоём
          </span>
          <h1 className="mt-4 text-2xl font-extrabold leading-tight tracking-tight sm:text-[32px]">
            Привет, Артём &amp; Катя 💞
          </h1>
          <p className="mt-2 text-sm text-white/80">
            {stats.todayTasks > 0
              ? `На сегодня осталось ${stats.todayTasks} ${plural(stats.todayTasks, ['задача', 'задачи', 'задач'])}. И ещё ${stats.goals} ${plural(stats.goals, ['мечта', 'мечты', 'мечт'])} ждут своего шага.`
              : `Все задачи на сегодня закрыты. Самое время заняться мечтами — их ${stats.goals}.`}
          </p>
          <div className="mt-5 flex flex-wrap gap-2.5">
            <Button
              variant="soft"
              icon={FiPlus}
              onClick={() => openModal('task')}
              className="border-none bg-white text-brand-600 shadow-soft hover:bg-white"
            >
              Новая задача
            </Button>
            <Button
              variant="soft"
              icon={FiCalendar}
              onClick={() => openModal('event')}
              className="bg-white/18 text-white hover:bg-white/28"
            >
              Событие
            </Button>
            <Button
              variant="soft"
              icon={FiHeart}
              onClick={() => openModal('wish')}
              className="bg-white/18 text-white hover:bg-white/28"
            >
              Желание
            </Button>
          </div>
        </div>

        <div className="w-full max-w-[220px] rounded-2xl bg-white/12 p-4 backdrop-blur-md ring-1 ring-white/20">
          <div className="flex items-center justify-between">
            <AvatarPair size="md" />
            <span className="text-2xl animate-float">{nearest.emoji}</span>
          </div>
          <p className="mt-3.5 text-xs font-semibold uppercase tracking-wide text-white/60">
            Ближайшая дата
          </p>
          <p className="mt-1 text-sm font-bold leading-tight">{nearest.title}</p>
          <p className="mt-0.5 text-xs text-white/70">
            {formatDate(nearest.date)} · {relativeDate(nearest.date)}
          </p>
        </div>
      </div>
    </Card>
  )
}

function TodayTasks() {
  const { tasks, toggleTask, setPage } = useApp()
  const today = todayISO()
  const list = tasks.filter((t) => t.dueDate <= today).slice(0, 5)

  return (
    <Card>
      <CardHeader
        icon={FiCheckCircle}
        title="Задачи на сегодня"
        subtitle="Отметьте выполненное — партнёр увидит сразу"
        action={
          <Button variant="ghost" size="sm" onClick={() => setPage('tasks')}>
            Все <FiArrowUpRight />
          </Button>
        }
      />
      <div className="space-y-2">
        {list.map((task) => {
          const style = ownerStyle(task.assigned)
          const done = task.status === 'done'
          return (
            <button
              key={task.id}
              type="button"
              onClick={() => toggleTask(task.id)}
              className="flex w-full items-center gap-3 rounded-2xl border border-transparent px-3 py-2.5 text-left transition hover:border-slate-200/80 hover:bg-slate-50/80 dark:hover:border-white/10 dark:hover:bg-white/[0.04]"
            >
              <span
                className={cx(
                  'grid h-5 w-5 shrink-0 place-items-center rounded-md border-2 transition-all duration-200',
                  done ? cx(style.solid, 'border-transparent text-white') : 'border-slate-300 dark:border-slate-600',
                )}
              >
                {done && <FiCheckCircle className="text-[11px]" />}
              </span>
              <span className="min-w-0 flex-1">
                <span
                  className={cx(
                    'block truncate text-sm font-semibold tracking-tight transition',
                    done && 'text-slate-400 line-through dark:text-slate-500',
                  )}
                >
                  {task.title}
                </span>
                <span className="mt-0.5 flex items-center gap-1.5 text-[11px] text-slate-400">
                  <FiClock className="text-[10px]" /> {relativeDate(task.dueDate)}
                </span>
              </span>
              <Avatar owner={task.assigned} size="xs" ring={false} />
            </button>
          )
        })}
      </div>
    </Card>
  )
}

function ActivityFeed() {
  const { activities, users } = useApp()

  return (
    <Card>
      <CardHeader icon={FiTrendingUp} title="Последние активности" subtitle="Что происходило у вас двоих" />
      <ol className="relative space-y-4 pl-1">
        <span className="absolute left-[19px] top-2 h-[calc(100%-18px)] w-px bg-slate-200 dark:bg-white/10" />
        {activities.map((item) => {
          const Icon = ACTIVITY_ICONS[item.icon] ?? FiTarget
          const style = ownerStyle(item.user)
          return (
            <li key={item.id} className="relative flex gap-3.5">
              <span
                className={cx(
                  'z-10 grid h-9 w-9 shrink-0 place-items-center rounded-full text-white shadow-soft ring-4 ring-white dark:ring-[#0b1020]',
                  style.gradient,
                )}
              >
                <Icon className="text-sm" />
              </span>
              <div className="min-w-0 pt-1">
                <p className="text-sm leading-snug">
                  <span className="font-bold tracking-tight">{users[item.user].name}</span>{' '}
                  <span className="text-slate-500 dark:text-slate-400">{item.text}</span>
                </p>
                <p className="mt-0.5 text-[11px] text-slate-400">{item.time}</p>
              </div>
            </li>
          )
        })}
      </ol>
    </Card>
  )
}

function Anniversaries() {
  const { anniversaries } = useApp()

  return (
    <Card>
      <CardHeader icon={FiHeart} title="Памятные даты" subtitle="Не пропустите главное" />
      <div className="space-y-2.5">
        {[...anniversaries]
          .sort((a, b) => a.date.localeCompare(b.date))
          .map((item) => (
            <div
              key={item.id}
              className="group flex items-center gap-3.5 rounded-2xl bg-slate-50/80 p-3 transition hover:bg-brand/8 dark:bg-white/[0.03] dark:hover:bg-brand/12"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white text-xl shadow-soft transition group-hover:scale-110 dark:bg-white/[0.06]">
                {item.emoji}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold tracking-tight">{item.title}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">{item.note}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-xs font-bold">{formatDate(item.date)}</p>
                <p className="text-[11px] text-brand-500 dark:text-brand-200">{relativeDate(item.date)}</p>
              </div>
            </div>
          ))}
      </div>
    </Card>
  )
}

function WishSpotlight() {
  const { wishes, setPage } = useApp()
  const top = [...wishes].sort((a, b) => b.progress - a.progress).slice(0, 3)

  return (
    <Card>
      <CardHeader
        icon={HiOutlineSparkles}
        title="Мечты в фокусе"
        subtitle="Ближе всего к исполнению"
        action={
          <Button variant="ghost" size="sm" onClick={() => setPage('wishes')}>
            Все <FiArrowUpRight />
          </Button>
        }
      />
      <div className="space-y-4">
        {top.map((wish) => (
          <div key={wish.id}>
            <div className="mb-1.5 flex items-center gap-2">
              <Avatar owner={wish.assigned} size="xs" ring={false} />
              <p className="min-w-0 flex-1 truncate text-sm font-semibold tracking-tight">{wish.title}</p>
              <span className="text-xs font-bold tabular-nums text-slate-500 dark:text-slate-400">
                {wish.progress}%
              </span>
            </div>
            <ProgressBar value={wish.progress} owner={wish.assigned} />
          </div>
        ))}
      </div>
    </Card>
  )
}

export default function Dashboard() {
  const { stats } = useApp()

  return (
    <div className="page-enter space-y-5">
      <HeroBanner />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Задач на сегодня"
          value={stats.todayTasks}
          caption={`Из них ${stats.todayShared} ${plural(stats.todayShared, ['общая', 'общие', 'общих'])}`}
          icon={FiCheckCircle}
          gradient="bg-grad-both"
          trend="+2"
        />
        <MetricCard
          label="Событий этого месяца"
          value={stats.monthEvents}
          caption={`${stats.monthShared} вместе, остальные личные`}
          icon={FiCalendar}
          gradient="bg-grad-him"
        />
        <MetricCard
          label="Общих целей"
          value={stats.goals}
          caption={`Средний прогресс ${stats.avgProgress}%`}
          icon={FiTarget}
          gradient="bg-grad-her"
          trend="+1"
        />
        <MetricCard
          label="Дни вместе"
          value={stats.daysTogether}
          caption={stats.togetherCaption}
          icon={FiHeart}
          gradient="bg-grad-brand"
        />
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="space-y-5 xl:col-span-2">
          <TodayTasks />
          <ActivityFeed />
        </div>
        <div className="space-y-5">
          <Anniversaries />
          <WishSpotlight />
        </div>
      </div>
    </div>
  )
}
