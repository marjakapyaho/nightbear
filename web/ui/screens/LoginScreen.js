import { Input } from 'react-bootstrap';
import { renderFromStore } from 'web/utils/react';

export default renderFromStore(

  __filename,

  state => state,

  (React, state, actions) => (

    <div className="this">
      <h1>Nightbear Login</h1>
      <p>We're not sure who you are, so if you'd be so kind as to provide some credentials.</p>
      <Input
        type="text"
        placeholder="https://user:pass@my.database.com/db_name"
        value={ '' }
        onChange={ () => {} }
      />
    </div>

  )

);
