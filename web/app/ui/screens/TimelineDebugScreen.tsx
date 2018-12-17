import { HOUR_IN_MS } from 'core/calculations/calculations';
import { TimelineModel } from 'core/models/model';
import { is } from 'core/models/utils';
import * as Highcharts from 'highcharts';
import * as HighchartsReact from 'highcharts-react-official';
import { isArray } from 'lodash';
import { assertExhausted, isNotNull } from 'server/utils/types';
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
function getOptions(models: TimelineModel[]): /* Highcharts.Options */ any {
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
      getSeries(models, 'Sensor'),
      getSeries(models, 'DexcomSensorEntry'),
      getSeries(models, 'DexcomRawSensorEntry'),
      getSeries(models, 'ParakeetSensorEntry'),
      getSeries(models, 'DexcomCalibration'),
      getSeries(models, 'NightbearCalibration'),
      getSeries(models, 'DeviceStatus'),
      getSeries(models, 'Hba1c'),
      getSeries(models, 'MeterEntry'),
      getSeries(models, 'Insulin'),
      getSeries(models, 'Carbs'),
      getSeries(models, 'Alarm'),
    ].filter(series => isArray(series.data) && series.data.length),
    time: {
      useUTC: false, // somewhat unintuitively, this needs to be false when model.timestamp is milliseconds since epoch in UTC :shrug:
    },
    credits: {
      enabled: false,
    },
  };
}

function getSeries(
  models: TimelineModel[],
  typeName: TimelineModel['modelType'],
): Highcharts.IndividualSeriesOptions {
  return {
    name: typeName,
    data: models
      .filter(is(typeName))
      .map(model => {
        switch (model.modelType) {
          case 'Sensor':
          case 'DexcomCalibration':
          case 'NightbearCalibration':
          case 'DeviceStatus':
          case 'Hba1c':
          case 'Insulin':
          case 'Carbs':
          case 'Alarm':
            return null; // not supported yet!
          case 'DexcomSensorEntry':
          case 'DexcomRawSensorEntry':
          case 'ParakeetSensorEntry':
          case 'MeterEntry':
            return model.bloodGlucose
              ? ([model.timestamp, model.bloodGlucose] as [number, number])
              : null;
          default:
            assertExhausted(model);
        }
      })
      .filter(isNotNull),
  };
}
