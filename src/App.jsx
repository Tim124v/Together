import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import { AppProvider } from './context/AppContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import { DataProvider } from './context/DataContext'
import BudgetPage from './pages/Budget'
import CalendarPage from './pages/CalendarPage'
import CoupleSetupPage from './pages/CoupleSetupPage'
import DashboardPage from './pages/DashboardPage'
import TimeCapsulesPage from './pages/TimeCapsules'
import { Home } from './pages'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import TasksPage from './pages/TasksPage'
import WishesPage from './pages/WishesPage'

function GuestOnly({ children }) {
  const { ready, user, couple, loading } = useAuth()
  if (!ready || loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-canvas text-sm font-semibold text-slate-500 dark:bg-[#0b1020]">
        Together загружается…
      </div>
    )
  }
  if (user) return <Navigate to={couple ? '/' : '/couple-setup'} replace />
  return children
}

function AppShell() {
  return (
    <DataProvider>
      <AppProvider>
        <Home />
      </AppProvider>
    </DataProvider>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route
            path="/login"
            element={
              <GuestOnly>
                <LoginPage />
              </GuestOnly>
            }
          />
          <Route
            path="/register"
            element={
              <GuestOnly>
                <RegisterPage />
              </GuestOnly>
            }
          />

          <Route element={<ProtectedRoute requireCouple={false} />}>
            <Route path="/couple-setup" element={<CoupleSetupPage />} />
          </Route>

          <Route element={<ProtectedRoute requireCouple />}>
            <Route element={<AppShell />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/tasks" element={<TasksPage />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/wishes" element={<WishesPage />} />
              <Route path="/capsules" element={<TimeCapsulesPage />} />
              <Route path="/budget" element={<BudgetPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
