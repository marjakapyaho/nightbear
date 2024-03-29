import 'frontend/App.scss';
import BgGraphScreen from 'frontend/pages/bgGraphScreen/BgGraphScreen';
import { Config } from 'frontend/pages/config/Config';
import TimelineDebugScreen from 'frontend/pages/timelineDebugScreen/TimelineDebugScreen';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import StatsScreen from 'frontend/pages/statsScreen/StatsScreen';
import React from 'react';

type Props = {};

export default (() => {
  return (
    <div className="nb-App">
      <Router>
        <Routes>
          <Route path="/" element={<BgGraphScreen />} />
          <Route path="/config" element={<Config />} />
          <Route path="/debug" element={<TimelineDebugScreen />} />
          <Route path="/stats" element={<StatsScreen />} />
        </Routes>
      </Router>
    </div>
  );
}) as React.FC<Props>;
