import { renderFromStore } from 'nightbear/web/utils/react';
import LoginScreen from 'nightbear/web/ui/screens/LoginScreen';

export default renderFromStore(

  __filename,

  state => state,

  (React, state, actions) => (

    <LoginScreen />

  )

);
