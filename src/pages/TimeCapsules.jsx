import { useEffect, useMemo, useState } from 'react'
import { FiPlus } from 'react-icons/fi'
import CapsuleList from '../components/TimeCapsules/CapsuleList'
import CapsulePreview from '../components/TimeCapsules/CapsulePreview'
import CreateCapsuleModal from '../components/TimeCapsules/CreateCapsuleModal'
import Button from '../components/shared/Button'
import { useData } from '../context/DataContext'
import { useSearchParams } from 'react-router-dom'

export default function TimeCapsules() {
  const { capsules, createCapsule, openCapsule, deleteCapsule, loadCapsule } = useData()
  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedId, setSelectedId] = useState(searchParams.get('id') || null)
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const selected = useMemo(
    () => capsules.find((row) => row.id === selectedId) || capsules[0] || null,
    [capsules, selectedId],
  )

  useEffect(() => {
    if (selected && selected.id !== selectedId) setSelectedId(selected.id)
  }, [selected, selectedId])

  useEffect(() => {
    if (!selected) {
      setDetail(null)
      return undefined
    }
    let cancelled = false
    setLoading(true)
    loadCapsule(selected.id)
      .then((row) => {
        if (!cancelled) setDetail(row)
      })
      .catch(() => {
        if (!cancelled) setDetail(selected)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [selected?.id, selected?.status, selected?.isOpened, loadCapsule])

  const view = detail && detail.id === selected?.id ? { ...selected, ...detail } : selected

  const share = async (capsule) => {
    const url = `${window.location.origin}/capsules?id=${capsule.id}`
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      window.prompt('Скопируйте ссылку', url)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-[#667eea]">Архив памяти</p>
          <h1 className="text-2xl font-extrabold tracking-tight">Капсулы времени</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Письма и фото, которые откроются в нужный день.
          </p>
        </div>
        <Button icon={FiPlus} onClick={() => setCreateOpen(true)}>
          Создать капсулу
        </Button>
      </div>

      {copied && (
        <p className="rounded-2xl bg-[#667eea]/12 px-4 py-2 text-xs font-bold text-[#667eea]">
          Ссылка скопирована
        </p>
      )}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
        <CapsuleList
          capsules={capsules}
          selectedId={view?.id}
          onSelect={(capsule) => {
            setSelectedId(capsule.id)
            setSearchParams(capsule.id ? { id: capsule.id } : {})
          }}
        />
        <CapsulePreview
          capsule={view}
          loading={loading}
          onOpen={openCapsule}
          onDelete={(capsule) => {
            if (window.confirm('Удалить эту капсулу?')) deleteCapsule(capsule.id)
          }}
          onShare={share}
        />
      </div>

      <CreateCapsuleModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={createCapsule}
      />
    </div>
  )
}
