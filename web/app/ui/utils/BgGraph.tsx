import { HOUR_IN_MS } from 'core/calculations/calculations';
import { TimelineModel, TimelineModelType } from 'core/models/model';
import { is } from 'core/models/utils';
import { NsFunction } from 'css-ns';
import * as Highcharts from 'highcharts';
import * as HighchartsReact from 'highcharts-react-official';
import { findIndex, first } from 'lodash';
import { DateTime } from 'luxon';
import { isNotNull } from 'server/utils/types';
import { actions } from 'web/app/modules/actions';
import { getFormattedTimestamp } from 'web/app/ui/utils/Timestamp';
import { renderFromProps } from 'web/app/utils/react';
import { ReduxDispatch } from 'web/app/utils/redux';

type Props = {
  timelineRange: number;
  timelineRangeEnd: number;
  selectedModelTypes: TimelineModelType[];
  timelineModels: TimelineModel[];
  timelineCursorAt: number | null;
  dispatch: ReduxDispatch;
};

export default renderFromProps<Props>(__filename, (React, props, cssNs) => {
  return (
    <div className="this">
      <HighchartsReact
        highcharts={Highcharts}
        options={getOptions(
          props.timelineModels,
          props.selectedModelTypes,
          props.timelineRange,
          props.timelineRangeEnd,
          props.timelineCursorAt,
          props.dispatch,
          cssNs,
        )}
      />
    </div>
  );
});

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
  visible: true,
  opposite: true,
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
  timelineCursorAt: number | null,
  dispatch: ReduxDispatch,
  cssNs: NsFunction<any>,
): Highcharts.Options {
  return {
    title: { text: null },
    chart: {
      height: 500,
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
        click(event) {
          const axis = first(event.xAxis);
          if (!axis) return;
          const { value } = axis;
          if (!value) return;
          event.stopPropagation(); // we don't want this to ALSO count as an outside-click
          dispatch(actions.TIMELINE_CURSOR_UPDATED(Math.round(value)));
        },
      },
      scrollablePlotArea: {
        minWidth: 800,
        scrollPositionX: 1, // i.e. start at the rightmost-edge
      },
    },
    xAxis: {
      type: 'datetime',
      minTickInterval: HOUR_IN_MS,
      min: timelineRangeEnd - timelineRange,
      max: timelineRangeEnd,
      plotLines: models
        .filter(is('ActiveProfile'))
        .map(
          (ap): Highcharts.PlotLines => ({
            value: ap.timestamp,
            dashStyle: 'Dash',
            className: cssNs('profileActivation'),
            color: 'blue',
            width: 3,
            zIndex: 2,
            label: {
              text: ap.profileName,
              style: { color: 'blue', fontWeight: 'bold' },
            },
            events: {
              click(event) {
                dispatch(actions.TIMELINE_CURSOR_UPDATED(null)); // clear existing cursor, if any
                event.stopPropagation(); // we don't want this to set a NEW cursor position
                dispatch(actions.MODEL_SELECTED_FOR_EDITING(ap));
              },
            },
          }),
        )
        .concat(
          timelineCursorAt
            ? [
                {
                  value: timelineCursorAt,
                  color: 'red',
                  width: 3,
                  zIndex: 3,
                  label: {
                    text: getFormattedTimestamp(timelineCursorAt),
                    style: { color: 'red', fontWeight: 'bold' },
                    rotation: 0,
                  },
                },
              ]
            : [],
        ),
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
      series: {
        cursor: 'pointer',
        point: {
          events: {
            click(event) {
              const point = (event as any).point;
              const model: TimelineModel | null = (point && point.model) || null;
              if (model) dispatch(actions.MODEL_SELECTED_FOR_EDITING(model));
              return true;
            },
          },
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
  const yAxis = findIndex(Y_AXIS_OPTIONS, yAxisAssociation);
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
