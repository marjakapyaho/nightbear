import { renderFromStore } from 'web/app/utils/react';
import Timestamp from 'web/app/ui/utils/Timestamp';

export default renderFromStore(
  __filename,
  state => state.timelineData,
  (React, state) => (
    <div className="this">
      {(() => {
        if (state.status === 'READY') {
          const last =
            state.models
              .filter(
                m =>
                  m.modelType === 'ParakeetSensorEntry' || m.modelType === 'DexcomRawSensorEntry',
              )
              .sort((a, b) => b.timestamp - a.timestamp)[0] || null;
          if (last)
            return (
              <span>
                Last BG update received <Timestamp ts={last.timestamp} />
              </span>
            );
        }
        return '(last BG not available)';
      })()}
    </div>
  ),
);
