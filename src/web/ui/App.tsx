import React from 'react';
import 'web/ui/App.scss';
import { useReduxState } from 'web/utils/react';

const App: React.FC = () => {
  const x = useReduxState(state => state.configVars);
  return <pre>{JSON.stringify(x, null, 2)}</pre>;
};

export default App;
