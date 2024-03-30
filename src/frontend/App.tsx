import 'frontend/App.scss';
import { BgGraph } from 'frontend/pages/bgGraph/BgGraph';
import { Config } from 'frontend/pages/config/Config';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Stats } from 'frontend/pages/stats/Stats';
import React from 'react';

type Props = {};

export default (() => {
  return (
    <div className="nb-App">
      <Router>
        <Routes>
          <Route path="/" element={<BgGraph />} />
          <Route path="/config" element={<Config />} />
          <Route path="/stats" element={<Stats />} />
        </Routes>
      </Router>
    </div>
  );
}) as React.FC<Props>;
