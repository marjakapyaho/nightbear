import { HOUR_IN_MS } from 'core/calculations/calculations';
import { ModelOfType, TimelineModel, TimelineModelType } from 'core/models/model';
import { is } from 'core/models/utils';
import * as Highcharts from 'highcharts';
import * as HighchartsReact from 'highcharts-react-official';
import { first, isArray, matches } from 'lodash';
import { DateTime } from 'luxon';
import { assertExhausted, isNotNull } from 'server/utils/types';
import { actions } from 'web/app/modules/actions';
import ModelTypeSelector from 'web/app/ui/utils/ModelTypeSelector';
import TimeRangeSelector from 'web/app/ui/utils/TimeRangeSelector';
import Timestamp from 'web/app/ui/utils/Timestamp';
import { renderFromStore } from 'web/app/utils/react';
import { ReduxDispatch } from 'web/app/utils/redux';
import { objectKeys } from 'web/app/utils/types';

export default renderFromStore(
  __filename,
  state => state.uiNavigation,
  (React, state, dispatch) => {
    if (state.selectedScreen !== 'TimelineDebugScreen') return null; // this screen can only be rendered if it's been selected in state
    return (
      <div className="this">
        <button
          onClick={() =>
            dispatch(
              actions.TIMELINE_FILTERS_CHANGED(
                state.timelineRange,
                state.timelineRangeEnd - state.timelineRange,
                state.selectedModelTypes,
              ),
            )
          }
        >
          Prev
        </button>
        <TimeRangeSelector
          value={state.timelineRange}
          onChange={range =>
            dispatch(
              actions.TIMELINE_FILTERS_CHANGED(
                range,
                state.timelineRangeEnd,
                state.selectedModelTypes,
              ),
            )
          }
        />
        <button
          onClick={() =>
            dispatch(
              actions.TIMELINE_FILTERS_CHANGED(
                state.timelineRange,
                state.timelineRangeEnd + state.timelineRange,
                state.selectedModelTypes,
              ),
            )
          }
        >
          Next
        </button>
        <button
          onClick={() =>
            dispatch(
              actions.TIMELINE_FILTERS_CHANGED(
                state.timelineRange * 2,
                state.timelineRangeEnd + state.timelineRange / 2,
                state.selectedModelTypes,
              ),
            )
          }
        >
          Zoom out
        </button>
        <p>
          Showing from
          <strong>
            <Timestamp ts={state.timelineRangeEnd - state.timelineRange} />
          </strong>
          to
          <strong>
            <Timestamp ts={state.timelineRangeEnd} />
          </strong>
        </p>
        <ModelTypeSelector
          multiple
          value={state.selectedModelTypes}
          onChange={newType =>
            dispatch(
              actions.TIMELINE_FILTERS_CHANGED(
                state.timelineRange,
                state.timelineRangeEnd,
                newType,
              ),
            )
          }
        />
        {state.loadedModels.status === 'FETCHING' && <pre>Fetching...</pre>}
        {state.loadedModels.status === 'ERROR' && (
          <pre>Error: ${state.loadedModels.errorMessage}</pre>
        )}
        {state.loadedModels.status === 'READY' && (
          <HighchartsReact
            highcharts={Highcharts}
            options={getOptions(
              state.loadedModels.models,
              state.selectedModelTypes,
              state.timelineRange,
              state.timelineRangeEnd,
              dispatch,
            )}
          />
        )}
      </div>
    );
  },
);

// https://www.highcharts.com/demo
// https://api.highcharts.com/highcharts/
function getOptions(
  models: TimelineModel[],
  selectedModelTypes: TimelineModelType[],
  timelineRange: number,
  timelineRangeEnd: number,
  dispatch: ReduxDispatch,
): Highcharts.Options {
  return {
    title: { text: null },
    chart: {
      animation: false,
      zoomType: 'x',
      events: {
        selection(event) {
          event.preventDefault(); // we handle the zoom ourselves; no need for the default Highcharts one
          const axis = first(event.xAxis);
          if (!axis) return;
          const { min, max } = axis;
          if (!min || !max) return;
          dispatch(actions.TIMELINE_FILTERS_CHANGED(max - min, max, selectedModelTypes));
        },
      },
    },
    xAxis: {
      type: 'datetime',
      minTickInterval: HOUR_IN_MS,
      min: timelineRangeEnd - timelineRange,
      max: timelineRangeEnd,
    },
    yAxis: [
      {
        max: 15,
        min: 2,
        tickAmount: 14,
        title: {
          text: 'Blood glucose (mmol/L)',
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
      {
        max: 100,
        min: 0,
        opposite: true,
        title: { text: 'Battery level (%)' },
        gridLineColor: 'transparent',
      },
    ],
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
      getSeries(models, 'DeviceStatus', { deviceName: 'dexcom' }),
      getSeries(models, 'DeviceStatus', { deviceName: 'dexcom-transmitter' }),
      getSeries(models, 'DeviceStatus', { deviceName: 'dexcom-uploader' }),
      getSeries(models, 'DeviceStatus', { deviceName: 'parakeet' }),
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
    tooltip: {
      useHTML: true,
      formatter() {
        const that: any = this; // this doesn't seem to be typed in @types/highcharts
        const ts = DateTime.fromMillis(that.x).toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS);
        if (that.point.model) {
          const json = JSON.stringify(that.point.model, null, 2);
          return `<strong>${ts}</strong><br /><pre>${json}</pre>`;
        } else {
          return `<strong>${ts}</strong><br /><pre>(no model)</pre>`;
        }
      },
    },
  };
}

function getSeries(
  models: TimelineModel[],
  typeName: TimelineModel['modelType'],
  filter?: Partial<ModelOfType<typeof typeName>>,
): Highcharts.IndividualSeriesOptions {
  return {
    name:
      typeName +
      (filter
        ? ` (${objectKeys(filter)
            .map(k => filter[k])
            .join(', ')})`
        : ''),
    data: models
      .filter(is(typeName))
      .filter(m => (filter ? matches(filter)(m) : true))
      .map(model => {
        switch (model.modelType) {
          case 'Sensor':
          case 'DexcomCalibration':
          case 'NightbearCalibration':
          case 'Hba1c':
          case 'Insulin':
          case 'Carbs':
          case 'Alarm':
            return null; // not supported yet!
          case 'DexcomSensorEntry':
          case 'DexcomRawSensorEntry':
          case 'ParakeetSensorEntry':
          case 'MeterEntry':
            return model.bloodGlucose ? { x: model.timestamp, y: model.bloodGlucose, model } : null;
          case 'DeviceStatus':
            return { x: model.timestamp, y: model.batteryLevel, model };
          default:
            assertExhausted(model);
        }
      })
      .filter(isNotNull),
    yAxis: typeName === 'DeviceStatus' ? 1 : 0,
  };
}
