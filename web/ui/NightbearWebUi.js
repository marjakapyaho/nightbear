import { renderFromStore } from 'web/utils/react';
import LoginScreen from 'web/ui/screens/LoginScreen';

export default renderFromStore(

  __filename,

  state => state,

  (React, state, actions) => (

    <LoginScreen />

  )

);
