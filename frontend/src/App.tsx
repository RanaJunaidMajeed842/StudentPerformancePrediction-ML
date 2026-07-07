import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Analytics } from './pages/Analytics'
import { Dashboard } from './pages/Dashboard'
import { Models } from './pages/Models'
import { Predict } from './pages/Predict'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/models" element={<Models />} />
          <Route path="/predict" element={<Predict />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
