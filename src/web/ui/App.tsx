import 'web/ui/App.scss';
import BgGraphScreen from 'web/ui/screens/bgGraphScreen/BgGraphScreen';
import ConfigScreen from 'web/ui/screens/configScreen/ConfigScreen';
import TimelineDebugScreen from 'web/ui/screens/timelineDebugScreen/TimelineDebugScreen';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import StatsScreen from 'web/ui/screens/statsScreen/StatsScreen';
import React from 'react';

type Props = {};

export default (() => {
  return (
    <div className="nb-App">
      <Router>
        <Switch>
          <Route path="/" component={BgGraphScreen} exact />
          <Route path="/config" component={ConfigScreen} exact />
          <Route path="/debug" component={TimelineDebugScreen} exact />
          <Route path="/stats" component={StatsScreen} exact />
        </Switch>
      </Router>
    </div>
  );
}) as React.FC<Props>;
