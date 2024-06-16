import './App.scss'
import { BgGraph } from './pages/bgGraph/BgGraph'
import { Config } from './pages/config/Config'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { Stats } from './pages/stats/Stats'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './data/queryClient'

export const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="nb-App">
        <pre style={{ textAlign: 'center' }}>TESTING</pre>
        <Router>
          <Routes>
            <Route path="/" element={<BgGraph />} />
            <Route path="/config" element={<Config />} />
            <Route path="/stats" element={<Stats />} />
          </Routes>
        </Router>
      </div>
    </QueryClientProvider>
  )
}
