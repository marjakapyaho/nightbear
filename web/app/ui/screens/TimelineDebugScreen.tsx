import { HOUR_IN_MS } from 'core/calculations/calculations';
import { TimelineModel, TimelineModelType } from 'core/models/model';
import * as Highcharts from 'highcharts';
import * as HighchartsReact from 'highcharts-react-official';
import { first } from 'lodash';
import { DateTime } from 'luxon';
import { isNotNull } from 'server/utils/types';
import { actions } from 'web/app/modules/actions';
import ModelTypeSelector from 'web/app/ui/utils/ModelTypeSelector';
import TimeRangeSelector from 'web/app/ui/utils/TimeRangeSelector';
import Timestamp from 'web/app/ui/utils/Timestamp';
import { renderFromStore } from 'web/app/utils/react';
import { ReduxDispatch } from 'web/app/utils/redux';

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
                state.timelineRangeEnd + Math.round(state.timelineRange / 2),
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

const Y_STATIC: Highcharts.AxisOptions = {
  visible: false,
};

const Y_INSULIN: Highcharts.AxisOptions = {
  visible: false,
  min: 0,
  max: 15,
};

const Y_CARBS: Highcharts.AxisOptions = {
  visible: false,
  min: 0,
  max: 100,
};

const Y_BG: Highcharts.AxisOptions = {
  visible: false,
  min: 2,
  max: 18,
};

const Y_HBA1C: Highcharts.AxisOptions = {
  visible: false,
};

const Y_BATTERY: Highcharts.AxisOptions = {
  visible: false,
  min: 0,
  max: 100,
};

const Y_BATTERY_DEX: Highcharts.AxisOptions = {
  visible: false,
};

const Y_AXIS_OPTIONS = [Y_STATIC, Y_INSULIN, Y_CARBS, Y_BG, Y_BATTERY, Y_BATTERY_DEX, Y_HBA1C];

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
          dispatch(
            actions.TIMELINE_FILTERS_CHANGED(
              Math.round(max - min),
              Math.round(max),
              selectedModelTypes,
            ),
          );
        },
      },
    },
    xAxis: {
      type: 'datetime',
      minTickInterval: HOUR_IN_MS,
      min: timelineRangeEnd - timelineRange,
      max: timelineRangeEnd,
    },
    yAxis: Y_AXIS_OPTIONS,
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
      // Blood glucose:
      getSeries(
        models,
        Y_BG,
        'DexcomSensorEntry',
        model => model.modelType === 'DexcomSensorEntry' && model.bloodGlucose, // <- plotted value
        { color: '#5bc0de' },
      ),
      getSeries(
        models,
        Y_BG,
        'DexcomRawSensorEntry',
        model => model.modelType === 'DexcomRawSensorEntry' && model.bloodGlucose, // <- plotted value
        { color: '#5bc0de' },
      ),
      getSeries(
        models,
        Y_BG,
        'ParakeetSensorEntry',
        model => model.modelType === 'ParakeetSensorEntry' && model.bloodGlucose, // <- plotted value
        { color: '#5bc0de' },
      ),
      getSeries(
        models,
        Y_BG,
        'MeterEntry',
        model => model.modelType === 'MeterEntry' && model.bloodGlucose, // <- plotted value
        { color: '#5bc0de' },
      ),

      // Battery:
      getSeries(
        models,
        Y_BATTERY_DEX,
        'DeviceStatus (Dexcom transmitter battery)',
        model =>
          model.modelType === 'DeviceStatus' &&
          model.deviceName === 'dexcom-transmitter' &&
          model.batteryLevel, // <- plotted value
        { color: '#63767c' },
      ),
      getSeries(
        models,
        Y_BATTERY,
        'DeviceStatus (Dexcom uploader battery)',
        model =>
          model.modelType === 'DeviceStatus' &&
          model.deviceName === 'dexcom-uploader' &&
          model.batteryLevel, // <- plotted value
        { color: '#63767c' },
      ),
      getSeries(
        models,
        Y_BATTERY,
        'DeviceStatus (Parakeet battery)',
        model =>
          model.modelType === 'DeviceStatus' &&
          model.deviceName === 'parakeet' &&
          model.batteryLevel, // <- plotted value
        { color: '#63767c' },
      ),

      // Miscellaneous:
      getSeries(
        models,
        Y_INSULIN,
        'Insulin',
        model => model.modelType === 'Insulin' && model.amount, // <- plotted value
        { type: 'column', color: '#f1318d' },
      ),
      getSeries(
        models,
        Y_CARBS,
        'Carbs',
        model => model.modelType === 'Carbs' && model.amount, // <- plotted value
        {
          type: 'column',
          color: '#59df59',
        },
      ),
      getSeries(
        models,
        Y_HBA1C,
        'HbA1c',
        model => model.modelType === 'Hba1c' && model.hba1cValue, // <- plotted value
        { color: '#00607c' },
      ),

      // Static:
      getSeries(
        models,
        Y_STATIC,
        'Sensor',
        model => model.modelType === 'Sensor' && 1, // <- plotted value
        {
          color: '#7c005d',
        },
      ),
      getSeries(
        models,
        Y_STATIC,
        'DexcomCalibration',
        model => model.modelType === 'DexcomCalibration' && 2, // <- plotted value
        {
          color: '#7c005d',
        },
      ),
      getSeries(
        models,
        Y_STATIC,
        'NightbearCalibration',
        model => model.modelType === 'NightbearCalibration' && 3, // <- plotted value
        {
          color: '#7c005d',
        },
      ),
      getSeries(
        models,
        Y_STATIC,
        'Alarm',
        model => model.modelType === 'Alarm' && 4, // <- plotted value
        {
          type: 'scatter',
          color: '#ffa600',
        },
      ),
    ],
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

type SeriesOptions = Highcharts.IndividualSeriesOptions & Highcharts.LineChart;

function getSeries(
  models: TimelineModel[],
  yAxisAssociation: Highcharts.AxisOptions,
  name: string,
  selector: (model: TimelineModel) => number | null | false,
  extraOptions?: Partial<SeriesOptions>,
): SeriesOptions {
  const yAxis = Y_AXIS_OPTIONS.indexOf(yAxisAssociation);
  if (yAxis === -1)
    throw new Error(`Could not determine Y axis association for series from "${yAxis}"`);
  return {
    stickyTracking: false,
    animation: false,
    name,
    yAxis,
    turboThreshold: 0, // Note: If we want to show REALLY large data sets at some point, it may make sense to re-enable this
    data: models
      .map(model => {
        const y = selector(model);
        if (!y) return null;
        return { x: model.timestamp, y, model };
      })
      .filter(isNotNull),
    ...extraOptions,
  };
}
