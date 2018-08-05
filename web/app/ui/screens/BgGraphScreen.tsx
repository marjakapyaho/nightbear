import { renderFromStore } from 'web/app/utils/react';
import * as Highcharts from 'highcharts';
import * as HighchartsReact from 'highcharts-react-official';
import { isNotNull } from 'server/utils/types';
import { TimelineModel } from 'core/models/model';

export default renderFromStore(
  __filename,
  state => state.timelineData,
  (React, state) => (
    <div className="this">
      {state.status === 'READY' && (
        <HighchartsReact highcharts={Highcharts} options={getOptions(state.models)} />
      )}
    </div>
  ),
);

// https://www.highcharts.com/demo
// https://api.highcharts.com/highcharts/
function getOptions(models: TimelineModel[]): Highcharts.Options {
  return {
    title: { text: null },
    xAxis: { type: 'datetime' },
    series: [
      {
        name: 'Dexcom',
        data: models
          .map(model => (model.modelType === 'DexcomSensorEntry' ? model : null))
          .filter(isNotNull)
          .map(
            model =>
              model.bloodGlucose
                ? ([model.timestamp, model.bloodGlucose] as [number, number])
                : null,
          )
          .filter(isNotNull),
      },
      {
        name: 'Parakeet',
        data: models
          .map(model => (model.modelType === 'ParakeetSensorEntry' ? model : null))
          .filter(isNotNull)
          .map(
            model =>
              model.bloodGlucose
                ? ([model.timestamp, model.bloodGlucose] as [number, number])
                : null,
          )
          .filter(isNotNull),
      },
    ],
  };
}
