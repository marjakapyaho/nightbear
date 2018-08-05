import { DateTime } from 'luxon';
import { renderFromStore } from 'web/app/utils/react';
import { groupBy, map, mean } from 'lodash';
import { ParakeetSensorEntry } from 'core/models/model';
import { is } from 'core/models/utils';
import { isNotNull } from 'server/utils/types';

export default renderFromStore(
  __filename,
  state => state.timelineData,
  (React, state) => (
    <div className="this">
      {state.status === 'READY' && (
        <table>
          <thead>
            <tr>
              <th>Day</th>
              <th>Entries</th>
              <th>Average BG</th>
              <th>High entries</th>
              <th>Low entries</th>
            </tr>
          </thead>
          <tbody>
            {getDailySummary(state.models.filter(is('ParakeetSensorEntry'))).map((row, i) => (
              <tr key={i}>
                <td>{row.day}</td>
                <td>{row.entries}</td>
                <td>{row.averageBg.toFixed(2)}</td>
                <td>{row.highs}</td>
                <td>{row.lows}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  ),
);

function getDailySummary(models: ParakeetSensorEntry[]) {
  const data = models
    .map(model => ({
      day: DateTime.fromMillis(model.timestamp).toLocaleString(DateTime.DATE_HUGE),
      bloodGlucose: model.bloodGlucose,
    }))
    .filter(x => isNotNull(x.bloodGlucose));
  return map(groupBy(data, 'day'), (values, day) => ({
    day,
    entries: values.length,
    averageBg: mean(values.map(val => val.bloodGlucose)),
    highs: values.filter(val => val.bloodGlucose && val.bloodGlucose > 10).length,
    lows: values.filter(val => val.bloodGlucose && val.bloodGlucose < 4).length,
  }));
}
