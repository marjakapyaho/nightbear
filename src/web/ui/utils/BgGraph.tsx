import { HOUR_IN_MS } from 'core/calculations/calculations';
import { MeterEntry, SensorEntry, TimelineModel, Insulin } from 'core/models/model';
import { NsFunction } from 'css-ns';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import HighchartsAnnotations from 'highcharts/modules/annotations';
import HighchartsMore from 'highcharts/highcharts-more'; // for e.g. chart type "bubble"
import { findIndex } from 'lodash';
import { isNotNull } from 'server/utils/types';
import 'web/ui/utils/BgGraph.scss';
import { useCssNs } from 'web/utils/react';
import { is } from 'core/models/utils';

HighchartsAnnotations(Highcharts);
HighchartsMore(Highcharts);

type Props = {
  timelineRange: number;
  timelineRangeEnd: number;
  bgModels: (SensorEntry | MeterEntry)[];
  insulinModels: Insulin[];
  timelineCursorAt: number | null;
  onBgModelSelected?: (model: SensorEntry | MeterEntry) => void;
  onInsulinModelSelected?: (model: Insulin) => void;
};

export default (props => {
  const { React, ns: cssNs } = useCssNs('BgGraph');

  return (
    <div className="this">
      <HighchartsReact highcharts={Highcharts} options={getHighchartsOptions(props, cssNs)} />
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
  height: 50, // this is the amount of pixels reserved for showing the insulin values at the top of the graph
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
function getHighchartsOptions(props: Props, cssNs: NsFunction<unknown>): Highcharts.Options {
  return {
    title: { text: undefined },
    chart: {
      animation: false,
      scrollablePlotArea: {
        minWidth: 2500,
        scrollPositionX: 1, // i.e. start at the rightmost-edge
      },
    },
    xAxis: {
      type: 'datetime',
      minTickInterval: HOUR_IN_MS,
      min: props.timelineRangeEnd - props.timelineRange,
      max: props.timelineRangeEnd,
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
