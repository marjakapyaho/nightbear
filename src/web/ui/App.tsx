import 'web/ui/App.scss';
import BgGraphScreen from 'web/ui/screens/bgGraphScreen/BgGraphScreen';
import ConfigScreen from 'web/ui/screens/configScreen/ConfigScreen';
import TimelineDebugScreen from 'web/ui/screens/timelineDebugScreen/TimelineDebugScreen';
import { useCssNs } from 'web/utils/react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

type Props = {};

export default (() => {
  const { React } = useCssNs('App');

  return (
    <div className="this">
      <Router>
        <Switch>
          <Route path="/" component={BgGraphScreen} exact />
          <Route path="/config" component={ConfigScreen} exact />
          <Route path="/debug" component={TimelineDebugScreen} exact />
        </Switch>
      </Router>
    </div>
  );
}) as React.FC<Props>;
