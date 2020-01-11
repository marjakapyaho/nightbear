import { runAnalysis } from 'core/analyser/analyser';
import { HOUR_IN_MS, MIN_IN_MS } from 'core/calculations/calculations';
import { mergeEntriesFeed } from 'core/entries/entries';
import { TimelineModel, TimelineModelType } from 'core/models/model';
import { is } from 'core/models/utils';
import { NsFunction } from 'css-ns';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { findIndex, first, last, range } from 'lodash';
import { DateTime } from 'luxon';
import { isNotNull } from 'server/utils/types';
import { ReduxActions } from 'web/modules/actions';
import 'web/ui/utils/TimelineModelGraph.scss';
import { getFormattedTimestamp } from 'web/ui/utils/Timestamp';
import { useCssNs, useReduxDispatch } from 'web/utils/react';
import { objectKeys } from 'web/utils/types';

type Props = {
  timelineRange: number;
  timelineRangeEnd: number;
  selectedModelTypes: TimelineModelType[];
  timelineModels: TimelineModel[];
  timelineCursorAt: number | null;
};

export default (props => {
  const { React, ns: cssNs } = useCssNs(module.id);
  const actions = useReduxDispatch();

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
          actions,
          cssNs,
        )}
      />
    </div>
  );
}) as React.FC<Props>;

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
  timelineCursorAt: number | null,
  actions: ReduxActions,
  cssNs: NsFunction<unknown>,
): Highcharts.Options {
  const activeProfile = last(models.filter(is('ActiveProfile')));
  let analysisRanges: Array<[number, number, number]> = [];
  if (activeProfile) {
    const bucket = 5 * MIN_IN_MS;
    analysisRanges = range(timelineRangeEnd - timelineRange + bucket, timelineRangeEnd, bucket).map(
      start => [start - 3 * HOUR_IN_MS, start - bucket, start] as [number, number, number],
    );
  }
  return {
    title: { text: undefined },
    chart: {
      height: 500,
      animation: false,
      zoomType: 'x',
      events: {
        selection(event): undefined {
          event.preventDefault(); // we handle the zoom ourselves; no need for the default Highcharts one
          const axis = first(event.xAxis);
          if (!axis) return;
          const { min, max } = axis;
          if (!min || !max) return;
          actions.TIMELINE_FILTERS_CHANGED(Math.round(max - min), Math.round(max), selectedModelTypes);
        },
        click(event: any) {
          // official Highcharts types are missing the PointerAxisCoordinatesObject part from this type :shrug:
          const axis = first((event as Highcharts.PointerAxisCoordinatesObject).xAxis);
          if (!axis) return;
          const { value } = axis;
          if (!value) return;
          event.stopPropagation(); // we don't want this to ALSO count as an outside-click
          actions.TIMELINE_CURSOR_UPDATED(Math.round(value));
        },
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
          (ap): Highcharts.XAxisPlotLinesOptions => ({
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
                if (!event) return;
                actions.TIMELINE_CURSOR_UPDATED(null); // clear existing cursor, if any
                event.stopPropagation(); // we don't want this to set a NEW cursor position
                actions.MODEL_SELECTED_FOR_EDITING(ap);
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
      plotBands: analysisRanges
        .map(([base, from, to]): Highcharts.XAxisPlotBandsOptions | null => {
          if (!activeProfile) return null;
          const sensorEntries = models
            .filter(is('DexcomSensorEntry', 'DexcomRawSensorEntry', 'ParakeetSensorEntry'))
            .filter(m => m.timestamp > base && m.timestamp < to);
          const state = runAnalysis(
            to,
            activeProfile,
            sensorEntries,
            models.filter(is('Insulin')).filter(m => m.timestamp > base && m.timestamp < to),
            undefined, // TODO: Which DeviceStatus should go here..?
            models
              .filter(is('Alarm'))
              .filter(m => m.timestamp > base && m.timestamp < to)
              .filter(a => a.isActive),
          );
          const stateOn = objectKeys(state)
            .map(key => (state[key] ? key : null))
            .filter(isNotNull);
          console.log(
            `Analysis at ${new Date(to).toISOString()} with ${sensorEntries.length} entries:`,
            stateOn.length ? stateOn : 'n/a',
          );
          if (!stateOn.length) return null;
          return {
            from,
            to,
            color: 'yellow',
            label: { text: stateOn.join('+'), rotation: 90, style: { color: 'orange' } },
            zIndex: 1,
          };
        })
        .filter(isNotNull),
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
              const model = getModelAtPoint(event.point);
              if (model) actions.MODEL_SELECTED_FOR_EDITING(model);
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
      getSeries(
        mergeEntriesFeed([
          models.filter(is('DexcomSensorEntry')),
          models.filter(is('DexcomRawSensorEntry')),
          models.filter(is('ParakeetSensorEntry')),
          models.filter(is('MeterEntry')),
        ]),
        Y_BG,
        'Merged',
        model => 'bloodGlucose' in model && model.bloodGlucose, // <- plotted value
        { color: '#0025ff' },
      ),

      // Battery:
      getSeries(
        models,
        Y_BATTERY_DEX,
        'DeviceStatus (Dexcom transmitter battery)',
        model => model.modelType === 'DeviceStatus' && model.deviceName === 'dexcom-transmitter' && model.batteryLevel, // <- plotted value
        { color: '#63767c' },
      ),
      getSeries(
        models,
        Y_BATTERY,
        'DeviceStatus (Dexcom uploader battery)',
        model => model.modelType === 'DeviceStatus' && model.deviceName === 'dexcom-uploader' && model.batteryLevel, // <- plotted value
        { color: '#63767c' },
      ),
      getSeries(
        models,
        Y_BATTERY,
        'DeviceStatus (Parakeet battery)',
        model => model.modelType === 'DeviceStatus' && model.deviceName === 'parakeet' && model.batteryLevel, // <- plotted value
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
        const ts = DateTime.fromMillis(this.x).toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS);
        const model = getModelAtPoint(this.point);
        if (model) {
          const json = JSON.stringify(model, null, 2);
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
  yAxisAssociation: Highcharts.AxisOptions,
  name: string,
  selector: (model: TimelineModel) => number | null | false,
  extraOptions?: Partial<Highcharts.SeriesOptionsType>,
): Highcharts.SeriesOptionsType {
  const yAxis = findIndex(Y_AXIS_OPTIONS, yAxisAssociation);
  if (yAxis === -1) throw new Error(`Could not determine Y axis association for series from "${yAxis}"`);
  return {
    type: 'line',
    stickyTracking: false,
    animation: false,
    name,
    yAxis,
    turboThreshold: 0, // Note: If we want to show REALLY large data sets at some point, it may make sense to re-enable this
    data: models
      .map(model => {
        const y = selector(model);
        if (!y) return null;
        return setModelAtPoint({ x: model.timestamp, y }, model);
      })
      .filter(isNotNull),
    ...(extraOptions as any), // Note: This is cheating a bit, but this code should be temporary :trademark:
  };
}

// Highcharts allows attaching arbitrary metadata to Points as they're created,
// but this isn't (understandably) visible on the type. This helper allows doing it
// more-or-less safely. For performance reasons, we mutate the given Point options.
function setModelAtPoint(point: Highcharts.PointOptionsObject, model: TimelineModel): Highcharts.PointOptionsObject {
  (point as any)._modelAtPoint = model;
  return point;
}

// Reverse of setModelAtPoint()
function getModelAtPoint(point: Highcharts.Point): TimelineModel | null {
  return (point as any)._modelAtPoint || null;
}
