import { by, is, last } from 'core/models/utils';
import Timestamp from 'web/app/ui/utils/Timestamp';
import { renderFromStore } from 'web/app/utils/react';

export default renderFromStore(
  __filename,
  state => state.timelineData,
  (React, state) => {
    const lastBg =
      state.status === 'READY'
        ? state.models
            .filter(is('DexcomSensorEntry', 'ParakeetSensorEntry'))
            .sort(by('timestamp'))
            .find(last)
        : null;
    return (
      <div className="this">
        {lastBg ? (
          <span>
            Last BG update <Timestamp ts={lastBg.timestamp} />
          </span>
        ) : (
          '(last BG not available)'
        )}
      </div>
    );
  },
);
