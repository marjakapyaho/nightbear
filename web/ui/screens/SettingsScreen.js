import { Input } from 'react-bootstrap';
import { renderFromStore } from 'web/utils/react';

export default renderFromStore(

  __filename,

  state => state,

  (React, state, actions) => (

    <div className="this">
      <h1>Nightbear Settings</h1>
      <label>
        <input
          type="checkbox"
          checked={ state.getIn([ 'database', 'currentSettings', 'alarmsOn' ]) }
          disabled={ state.getIn([ 'database', 'databaseWorking' ]) }
          onChange={ event => actions.database.updateSettings(state.getIn([ 'database', 'currentSettings' ]).set('alarmsOn', !!event.target.checked)) }
          />
        Alarms enabled
      </label>
    </div>

  )

);
