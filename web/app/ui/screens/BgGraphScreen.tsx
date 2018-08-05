import { renderFromStore } from 'web/app/utils/react';
import * as Highcharts from 'highcharts';
import * as HighchartsReact from 'highcharts-react-official';
import { isNotNull } from 'server/utils/types';
import { TimelineModel } from 'core/models/model';
import ModelTypeSelector from 'web/app/ui/utils/ModelTypeSelector';
import TimeRangeSelector from 'web/app/ui/utils/TimeRangeSelector';
import { actions } from 'web/app/modules/actions';

export default renderFromStore(
  __filename,
  state => state.timelineData,
  (React, state, dispatch) => (
    <div className="this">
      <ModelTypeSelector
        onChange={newType =>
          dispatch(actions.TIMELINE_FILTERS_CHANGED(state.filters.range, Date.now(), [newType]))
        }
      />
      <TimeRangeSelector
        onChange={range =>
          dispatch(actions.TIMELINE_FILTERS_CHANGED(range, Date.now(), state.filters.modelTypes))
        }
      />
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
