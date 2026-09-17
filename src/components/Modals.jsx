import { useEffect, useState } from 'react'
import { FiCalendar, FiCheckSquare, FiHeart } from 'react-icons/fi'
import { useApp } from '../context/AppContext'
import { wishCategories } from '../data/mockData'
import { PRIORITY, cx, todayISO } from '../utils/helpers'
import Button from './shared/Button'
import Modal from './shared/Modal'
import OwnerPicker from './shared/OwnerPicker'

function useForm(initial, open) {
  const [values, setValues] = useState(initial)
  useEffect(() => {
    if (open) setValues(initial)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])
  const set = (key) => (e) => setValues((v) => ({ ...v, [key]: e?.target ? e.target.value : e }))
  return [values, set, setValues]
}

function AddTaskModal({ open, onClose }) {
  const { addTask } = useApp()
  const [values, set] = useForm(
    { title: '', assigned: 'both', dueDate: todayISO(), status: 'todo', note: '' },
    open,
  )

  const submit = async () => {
    if (!values.title.trim()) return
    await addTask({ ...values, title: values.title.trim() })
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      icon={FiCheckSquare}
      title="Новая задача"
      subtitle="Появится в канбане у вас обоих"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Отмена
          </Button>
          <Button onClick={submit} disabled={!values.title.trim()}>
            Создать задачу
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="label">Что нужно сделать</label>
          <input
            autoFocus
            value={values.title}
            onChange={set('title')}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            placeholder="Например, купить продукты"
            className="field"
          />
        </div>

        <div>
          <label className="label">Ответственный</label>
          <OwnerPicker value={values.assigned} onChange={set('assigned')} />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Срок</label>
            <input type="date" value={values.dueDate} onChange={set('dueDate')} className="field" />
          </div>
          <div>
            <label className="label">Колонка</label>
            <select value={values.status} onChange={set('status')} className="field">
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>
        </div>

        <div>
          <label className="label">Заметка (необязательно)</label>
          <input value={values.note} onChange={set('note')} placeholder="Детали, ссылки, напоминания" className="field" />
        </div>
      </div>
    </Modal>
  )
}

function AddEventModal({ open, onClose }) {
  const { addEvent } = useApp()
  const [values, set] = useForm(
    { title: '', participants: 'both', date: todayISO(), time: '19:00', place: '' },
    open,
  )

  const submit = async () => {
    if (!values.title.trim()) return
    await addEvent({ ...values, title: values.title.trim(), place: values.place.trim() || 'Место уточняется' })
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      icon={FiCalendar}
      title="Новое событие"
      subtitle="Отметится в общем календаре"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Отмена
          </Button>
          <Button onClick={submit} disabled={!values.title.trim()}>
            Добавить в календарь
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="label">Название события</label>
          <input
            autoFocus
            value={values.title}
            onChange={set('title')}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            placeholder="Например, ужин в новом месте"
            className="field"
          />
        </div>

        <div>
          <label className="label">Участники</label>
          <OwnerPicker value={values.participants} onChange={set('participants')} />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Дата</label>
            <input type="date" value={values.date} onChange={set('date')} className="field" />
          </div>
          <div>
            <label className="label">Время</label>
            <input type="time" value={values.time} onChange={set('time')} className="field" />
          </div>
        </div>

        <div>
          <label className="label">Место</label>
          <input value={values.place} onChange={set('place')} placeholder="Адрес или заведение" className="field" />
        </div>
      </div>
    </Modal>
  )
}

function AddWishModal({ open, onClose }) {
  const { addWish } = useApp()
  const [values, set] = useForm(
    {
      title: '',
      description: '',
      category: 'travel',
      assigned: 'both',
      priority: 'med',
      dueDate: todayISO(),
      progress: 0,
    },
    open,
  )

  const submit = async () => {
    if (!values.title.trim()) return
    await addWish({
      ...values,
      title: values.title.trim(),
      description: values.description.trim() || 'Пока без описания — главное начать',
      progress: Number(values.progress),
    })
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      icon={FiHeart}
      title="Новое желание"
      subtitle="Мечта, к которой идёте вместе"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Отмена
          </Button>
          <Button onClick={submit} disabled={!values.title.trim()}>
            Добавить мечту
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="label">О чём мечтаете</label>
          <input
            autoFocus
            value={values.title}
            onChange={set('title')}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            placeholder="Например, поездка в Бали"
            className="field"
          />
        </div>

        <div>
          <label className="label">Описание</label>
          <textarea
            rows={2}
            value={values.description}
            onChange={set('description')}
            placeholder="Пара слов, чтобы вдохновляло"
            className="field resize-none"
          />
        </div>

        <div>
          <label className="label">Категория</label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {wishCategories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => set('category')(cat.id)}
                className={cx(
                  'flex flex-col items-center gap-1 rounded-xl border px-2 py-2.5 text-[11px] font-bold transition',
                  values.category === cat.id
                    ? 'border-brand bg-brand/8 text-brand-600 dark:text-brand-200'
                    : 'border-slate-200 text-slate-500 hover:border-brand/40 dark:border-white/10 dark:text-slate-400',
                )}
              >
                <span className="text-base">{cat.emoji}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label">Назначено на</label>
          <OwnerPicker value={values.assigned} onChange={set('assigned')} />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Желаемая дата</label>
            <input type="date" value={values.dueDate} onChange={set('dueDate')} className="field" />
          </div>
          <div>
            <label className="label">Приоритет</label>
            <div className="flex gap-1 rounded-xl bg-slate-100/80 p-1 dark:bg-white/[0.06]">
              {Object.entries(PRIORITY).map(([key, meta]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => set('priority')(key)}
                  className={cx(
                    'h-9 flex-1 rounded-lg text-xs font-bold transition',
                    values.priority === key
                      ? cx(meta.className, 'shadow-soft')
                      : 'text-slate-500 hover:text-ink dark:text-slate-400',
                  )}
                >
                  {meta.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="label">Стартовый прогресс: {values.progress}%</label>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={values.progress}
            onChange={set('progress')}
            className="w-full accent-brand"
          />
        </div>
      </div>
    </Modal>
  )
}

export default function Modals() {
  const { modal, closeModal } = useApp()

  return (
    <>
      <AddTaskModal open={modal === 'task'} onClose={closeModal} />
      <AddEventModal open={modal === 'event'} onClose={closeModal} />
      <AddWishModal open={modal === 'wish'} onClose={closeModal} />
    </>
  )
}
