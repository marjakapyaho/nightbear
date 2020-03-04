import { useReduxActions, useReduxState } from 'web/utils/react';
import React from 'react';

type Props = {};

export default (() => {
  const state = useReduxState(s => s.uiNavigation);
  const actions = useReduxActions();

  return <div>TODO: SettingsScreen</div>;
}) as React.FC<Props>;
