import { useEffect, useState } from 'react'
import { FiPackage } from 'react-icons/fi'
import Button from '../shared/Button'
import Modal from '../shared/Modal'
import { todayISO } from '../../utils/helpers'

const empty = {
  title: '',
  description: '',
  openDate: '',
  tags: '',
  images: [],
}

export default function CreateCapsuleModal({ open, onClose, onCreate }) {
  const [values, setValues] = useState(empty)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      setValues(empty)
      setError('')
    }
  }, [open])

  const addFiles = async (files) => {
    const next = [...values.images]
    for (const file of [...files].slice(0, 5 - next.length)) {
      if (!file.type.startsWith('image/')) continue
      const dataUrl = await readFile(file)
      next.push(dataUrl)
    }
    setValues((v) => ({ ...v, images: next.slice(0, 5) }))
  }

  const submit = async () => {
    if (!values.title.trim()) return
    setSaving(true)
    setError('')
    try {
      await onCreate({
        title: values.title.trim(),
        description: values.description.trim(),
        openDate: values.openDate || null,
        text: values.description.trim(),
        images: values.images,
        tags: values.tags.split(',').map((t) => t.trim()).filter(Boolean),
        createdDate: todayISO(),
      })
      onClose()
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Не получилось сохранить капсулу')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      icon={FiPackage}
      title="Новая капсула"
      subtitle="Текст, фото и дата, когда её можно открыть"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Отмена
          </Button>
          <Button onClick={submit} disabled={!values.title.trim() || saving}>
            {saving ? 'Сохраняем…' : 'Создать капсулу'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="label">Название</label>
          <input
            autoFocus
            value={values.title}
            onChange={(e) => setValues((v) => ({ ...v, title: e.target.value }))}
            placeholder="Наша первая поездка"
            className="field"
          />
        </div>
        <div>
          <label className="label">Описание</label>
          <textarea
            rows={4}
            value={values.description}
            onChange={(e) => setValues((v) => ({ ...v, description: e.target.value }))}
            placeholder="Письмо себе из сегодняшнего дня…"
            className="field resize-none"
          />
        </div>
        <div>
          <label className="label">Дата открытия (необязательно)</label>
          <input
            type="date"
            min={todayISO()}
            value={values.openDate}
            onChange={(e) => setValues((v) => ({ ...v, openDate: e.target.value }))}
            className="field"
          />
          <p className="mt-1 text-[11px] text-slate-400">Пусто — капсула сразу открыта для вас обоих.</p>
        </div>
        <div>
          <label className="label">Фото, до 5</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => {
              addFiles(e.target.files || [])
              e.target.value = ''
            }}
            className="field file:mr-3 file:rounded-lg file:border-0 file:bg-[#667eea]/15 file:px-3 file:py-1 file:text-xs file:font-bold file:text-[#667eea]"
          />
          {values.images.length > 0 && (
            <div className="mt-3 grid grid-cols-5 gap-2">
              {values.images.map((src, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setValues((v) => ({ ...v, images: v.images.filter((_, idx) => idx !== i) }))}
                  className="overflow-hidden rounded-xl"
                  title="Убрать фото"
                >
                  <img src={src} alt="" className="h-14 w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
        <div>
          <label className="label">Теги</label>
          <input
            value={values.tags}
            onChange={(e) => setValues((v) => ({ ...v, tags: e.target.value }))}
            placeholder="лето, поездка, мы"
            className="field"
          />
        </div>
        {error && <p className="text-xs font-semibold text-rose-500">{error}</p>}
      </div>
    </Modal>
  )
}

function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
