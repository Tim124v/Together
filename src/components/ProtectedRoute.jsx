import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ requireCouple = false }) {
  const { ready, user, couple, loading } = useAuth()
  const location = useLocation()

  if (!ready || loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-canvas text-sm font-semibold text-slate-500 dark:bg-[#0b1020]">
        Together загружается…
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (requireCouple && !couple) {
    return <Navigate to="/couple-setup" replace />
  }

  if (!requireCouple && couple && location.pathname === '/couple-setup') {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
