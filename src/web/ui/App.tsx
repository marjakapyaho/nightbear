import 'web/ui/App.scss';
import BgGraphScreen from 'web/ui/screens/bgGraphScreen/BgGraphScreen';
import ConfigScreen from 'web/ui/screens/configScreen/ConfigScreen';
import TimelineDebugScreen from 'web/ui/screens/timelineDebugScreen/TimelineDebugScreen';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import StatsScreen from 'web/ui/screens/statsScreen/StatsScreen';
import React from 'react';

type Props = {};

export default (() => {
  return (
    <div className="nb-App">
      <Router>
        <Routes>
          <Route path="/" element={<BgGraphScreen />} />
          <Route path="/config" element={<ConfigScreen />} />
          <Route path="/debug" element={<TimelineDebugScreen />} />
          <Route path="/stats" element={<StatsScreen />} />
        </Routes>
      </Router>
    </div>
  );
}) as React.FC<Props>;
