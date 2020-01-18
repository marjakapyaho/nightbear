import { HOUR_IN_MS } from 'core/calculations/calculations';
import { PIXELS_PER_HOUR } from 'core/config/const';
import { Insulin, MeterEntry, SensorEntry, TimelineModel } from 'core/models/model';
import { is } from 'core/models/utils';
import { NsFunction } from 'css-ns';
import { first } from 'lodash';
import { isNotNull } from 'server/utils/types';
import 'web/ui/utils/BgGraph.scss';
import Highcharts from 'web/ui/utils/Highcharts';
import { useCssNs } from 'web/utils/react';

type Props = {
  timelineRange: number;
  timelineRangeEnd: number;
  bgModels: (SensorEntry | MeterEntry)[];
  insulinModels: Insulin[];
  cursorAt: number | null;
  onBgModelSelected?: (model: SensorEntry | MeterEntry) => void;
  onInsulinModelSelected?: (model: Insulin) => void;
  onCursorUpdated?: (timestamp: number | null) => void;
};

export default (props => {
  const { React, ns: cssNs } = useCssNs('BgGraph');

  const chartWidth = Math.round(PIXELS_PER_HOUR * (props.timelineRange / HOUR_IN_MS));

  return (
    <div className="this">
      <div className="scroller" style={{ width: chartWidth }}>
        {/* TODO: This scroller element shouldn't be needed once https://github.com/highcharts/highcharts/issues/8862 is fixed */}
        <Highcharts options={getHighchartsOptions(props, chartWidth, cssNs)} />
      </div>
    </div>
  );
}) as React.FC<Props>;

const Y_STATIC: Highcharts.AxisOptions = {
  visible: false,
};

const Y_INSULIN: Highcharts.AxisOptions = {
  id: 'insulin',
  visible: false,
  min: 0, // note: this axis is positional only (that is, it doesn't reflect the amount of insulin)
  max: 1,
  height: 80, // this is the amount of pixels reserved for showing the insulin values at the top of the graph
};

const Y_CARBS: Highcharts.AxisOptions = {
  visible: false,
  min: 0,
  max: 100,
};

const Y_BG: Highcharts.AxisOptions = {
  id: 'bg',
  visible: true,
  opposite: true,
  min: 2,
  max: 20,
  allowDecimals: false,
  tickInterval: 1,
  endOnTick: false,
  startOnTick: false,
  title: { text: null },
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
function getHighchartsOptions(props: Props, chartWidth: number, cssNs: NsFunction<unknown>): Highcharts.Options {
  return {
    title: { text: undefined },
    chart: {
      width: chartWidth,
      animation: false,
      /*
      // TODO: Use this (instead of the "scroller" element) when https://github.com/highcharts/highcharts/issues/8862 gets a fix
      scrollablePlotArea: {
        minWidth: 2500,
        scrollPositionX: 1, // i.e. start at the rightmost-edge
      },
      */
      events: {
        click(
          event: any /* official Highcharts types are missing the PointerAxisCoordinatesObject part from this type :shrug: */,
        ) {
          if (!props.onCursorUpdated) return;
          const axis = first((event as Highcharts.PointerAxisCoordinatesObject).xAxis);
          if (!axis) return;
          const { value } = axis;
          if (!value) return;
          // See the following issues for why this is needed:
          // https://github.com/highcharts/highcharts/issues/8862
          // https://github.com/highcharts/highcharts/issues/12682#issuecomment-575077172
          // I thus also have exactly 0 interest in figuring out why the magic number is needed (probably some padding somewhere, whatever)...
          const scrollParent = this.container.closest('.nb-BgGraph');
          const correction = scrollParent ? ((scrollParent.scrollLeft * 1.019) / PIXELS_PER_HOUR) * HOUR_IN_MS : 0;
          event.stopPropagation(); // we don't want this to ALSO count as an outside-click
          props.onCursorUpdated(Math.round(value + correction));
        },
      },
    },
    plotOptions: {
      series: {
        states: {
          hover: { enabled: false }, // on touch devices, hovers are triggered along with taps, but they tend to get stuck until the next such tap/hover; we don't want that
          inactive: { opacity: 1 }, // similarly, during the hover, other series would fade out; don't want that, either
        },
      },
    },
    xAxis: {
      type: 'datetime',
      minTickInterval: HOUR_IN_MS,
      min: props.timelineRangeEnd - props.timelineRange,
      max: props.timelineRangeEnd,
      plotLines: ([] as Highcharts.XAxisPlotLinesOptions[])
        .concat(
          props.insulinModels.map(model => ({
            value: model.timestamp,
            color: 'hotpink',
            label: {
              text: `${((Date.now() - model.timestamp) / HOUR_IN_MS).toFixed(1)} h ago`,
              style: { color: 'hotpink', fontWeight: 'bold' },
              rotation: 0,
              align: 'center',
            },
          })),
        )
        .concat(
          props.cursorAt
            ? {
                value: props.cursorAt,
                color: 'red',
                width: 3,
                events: {
                  click(event) {
                    if (!props.onCursorUpdated) return;
                    if (!event) return;
                    props.onCursorUpdated(null); // clear existing cursor, if any
                    event.stopPropagation(); // we don't want this to set a NEW cursor position
                  },
                },
              }
            : [],
        ),
    },
    yAxis: Y_AXIS_OPTIONS,
    series: [
      {
        type: 'line',
        stickyTracking: false,
        animation: false,
        name: 'Blood glucose',
        yAxis: Y_BG.id,
        turboThreshold: 0, // Note: If we want to show REALLY large data sets at some point, it may make sense to re-enable this
        marker: {
          enabled: true,
          symbol: 'circle',
          radius: 3,
        },
        cursor: 'pointer',
        data: props.bgModels
          .map(model => {
            if (!model.bloodGlucose) return null;
            return setModelAtPoint({ x: model.timestamp, y: model.bloodGlucose }, model);
          })
          .filter(isNotNull),
        events: {
          click(event) {
            if (!props.onBgModelSelected) return;
            const model = getModelAtPoint(event.point);
            if (!model || !('bloodGlucose' in model)) return;
            props.onBgModelSelected(model);
          },
        },
      },
      {
        type: 'bubble',
        stickyTracking: false,
        animation: false,
        name: 'Insulin',
        yAxis: Y_INSULIN.id,
        turboThreshold: 0, // Note: If we want to show REALLY large data sets at some point, it may make sense to re-enable this
        dataLabels: {
          enabled: true,
          format: '{point.name}',
        },
        marker: {
          enabled: true,
          fillColor: 'hotpink',
        },
        minSize: 15, // these values effectively set the size of the bubbles
        maxSize: 50,
        data: props.insulinModels
          .map(model => {
            if (!model.amount) return null;
            return setModelAtPoint(
              {
                x: model.timestamp,
                y: 0.5, // this is only for vertical positioning!
                z: model.amount,
                name: model.amount,
              },
              model,
            );
          })
          .filter(isNotNull),
        events: {
          click(event) {
            if (!props.onInsulinModelSelected) return;
            const model = getModelAtPoint(event.point);
            if (!is('Insulin')(model)) return;
            props.onInsulinModelSelected(model);
          },
        },
      },
    ],
    time: {
      useUTC: false, // somewhat unintuitively, this needs to be false when model.timestamp is milliseconds since epoch in UTC :shrug:
    },
    credits: {
      enabled: false,
    },
    legend: {
      enabled: false,
    },
    tooltip: {
      enabled: false,
    },
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
