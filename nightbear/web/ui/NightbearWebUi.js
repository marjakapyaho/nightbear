import { PropTypes } from 'react';
import { renderFromStore } from 'nightbear/web/utils/react';

export default renderFromStore(

  __filename,

  state => state,

  (React, state, actions) => (

    <p>Hello, world!</p>

  )

);
