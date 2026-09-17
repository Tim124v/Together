import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ requireCouple = false }) {
  const { ready, user, couple, loading } = useAuth()
  const { t } = useTranslation()
  const location = useLocation()

  if (!ready || loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-canvas text-sm font-semibold text-slate-500 dark:bg-[#0b1020]">
        {t('common.loading')}
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (requireCouple && !couple) {
    return <Navigate to="/couple-setup" replace />
  }

  return <Outlet />
}
