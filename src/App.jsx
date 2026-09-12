import { AppProvider } from './context/AppContext'
import { Home } from './pages'

export default function App() {
  return (
    <AppProvider>
      <Home />
    </AppProvider>
  )
}
