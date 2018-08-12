import { renderFromStore } from 'web/app/utils/react';
import * as Highcharts from 'highcharts';
import * as HighchartsReact from 'highcharts-react-official';
import { isNotNull } from 'server/utils/types';
import { TimelineModel } from 'core/models/model';
import ModelTypeSelector from 'web/app/ui/utils/ModelTypeSelector';
import TimeRangeSelector from 'web/app/ui/utils/TimeRangeSelector';
import { actions } from 'web/app/modules/actions';
import { HOUR_IN_MS } from 'core/calculations/calculations';

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
    xAxis: {
      type: 'datetime',
      minTickInterval: HOUR_IN_MS,
    },
    yAxis: {
      max: 20,
      min: 2,
      tickAmount: 10,
      title: {
        text: null,
      },
    },
    plotOptions: {
      line: {
        marker: {
          enabled: true,
          symbol: 'circle',
          radius: 4,
        },
      },
      series: {
        zones: [
          {
            value: 6,
            color: '#ff5722',
          },
            {
            value: 10,
            color: '#4caf50',
          },
            {
            color: '#ff9800',
          },
        ],
      },
    },
    legend: {
      enabled: false,
    },
    series: [
      /*
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
      */
      {
        name: 'Parakeet',
        threshold: 10,
        negativeColor: 'green',
        color: 'red',
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
      } as any,
    ],
    credits: {
      enabled: false,
    },
  };
}
