import { HOUR_IN_MS } from 'core/calculations/calculations';
import { TimelineModel } from 'core/models/model';
import * as Highcharts from 'highcharts';
import * as HighchartsReact from 'highcharts-react-official';
import { isNotNull } from 'server/utils/types';
import { actions } from 'web/app/modules/actions';
import TimeRangeSelector from 'web/app/ui/utils/TimeRangeSelector';
import { renderFromStore } from 'web/app/utils/react';

export default renderFromStore(
  __filename,
  state => state.timelineData,
  (React, state, dispatch) => (
    <div className="this">
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
      max: 15,
      min: 2,
      tickAmount: 14,
      title: {
        text: null,
      },
      plotBands: [
        {
          color: 'rgba(255, 152, 0, 0.06)',
          from: 8,
          to: 16,
        },
        {
          color: 'rgba(75, 175, 80, 0.06)',
          from: 4,
          to: 8,
        },
        {
          color: 'rgba(255, 87, 34, 0.06)',
          from: 2,
          to: 4,
        },
      ],
    },
    plotOptions: {
      line: {
        marker: {
          enabled: true,
          symbol: 'circle',
          radius: 3,
        },
      },
    },
    series: [
      {
        name: 'Parakeet',
        data: models
          .map(model => (model.modelType === 'ParakeetSensorEntry' ? model : null))
          .filter(isNotNull)
          .map(model =>
            model.bloodGlucose ? ([model.timestamp, model.bloodGlucose] as [number, number]) : null,
          )
          .filter(isNotNull),
      } as any,
    ],
    credits: {
      enabled: false,
    },
  };
}
