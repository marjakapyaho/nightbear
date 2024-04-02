import 'frontend/App.scss';
import { BgGraph } from 'frontend/pages/bgGraph/BgGraph';
import { Config } from 'frontend/pages/config/Config';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Stats } from 'frontend/pages/stats/Stats';
import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from 'frontend/data/queryClient';

type Props = {};

export default (() => {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="nb-App">
        <Router>
          <Routes>
            <Route path="/" element={<BgGraph />} />
            <Route path="/config" element={<Config />} />
            <Route path="/stats" element={<Stats />} />
          </Routes>
        </Router>
      </div>
    </QueryClientProvider>
  );
}) as React.FC<Props>;
