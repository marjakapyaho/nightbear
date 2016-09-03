import { renderFromStore } from 'web/utils/react';
import SettingsScreen from 'web/ui/screens/SettingsScreen';

export default renderFromStore(

  __filename,

  state => state,

  (React, state, actions) => (

    <SettingsScreen />

  )

);
