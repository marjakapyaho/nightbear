import { useReduxActions, useReduxState } from 'web/utils/react';
import React from 'react';

type Props = {};

export default (() => {
  const state = useReduxState(s => s.configVars);
  const actions = useReduxActions();

  return (
    <div>
      <label>
        <input type="checkbox" checked={state.showRollingAnalysis} onChange={actions.ROLLING_ANALYSIS_TOGGLED} />
        Show rolling analysis
      </label>
    </div>
  );
}) as React.FC<Props>;
