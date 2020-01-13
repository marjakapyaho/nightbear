import { HOUR_IN_MS } from 'core/calculations/calculations';
import { mergeEntriesFeed } from 'core/entries/entries';
import { TimelineModel } from 'core/models/model';
import { is } from 'core/models/utils';
import * as Highcharts from 'highcharts';
import * as HighchartsReact from 'highcharts-react-official';
import { findIndex } from 'lodash';
import { isNotNull } from 'server/utils/types';
import { renderFromProps } from 'web/app/utils/react';

type Props = {
  timelineRange: number;
  timelineRangeEnd: number;
  timelineModels: TimelineModel[];
};

export default renderFromProps<Props>(__filename, (React, props) => {
  return (
    <div className="this">
      <HighchartsReact
        highcharts={Highcharts}
        options={getOptions(props.timelineModels, props.timelineRange, props.timelineRangeEnd)}
      />
    </div>
  );
});

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
  max: 20,
  allowDecimals: false,
  tickInterval: 1,
  endOnTick: false,
  startOnTick: false,
  title: { text: null },
};

const Y_AXIS_OPTIONS = [Y_INSULIN, Y_CARBS, Y_BG];

// https://www.highcharts.com/demo
// https://api.highcharts.com/highcharts/
function getOptions(
  models: TimelineModel[],
  timelineRange: number,
  timelineRangeEnd: number,
): Highcharts.Options {
  return {
    title: { text: null },
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
      series: {
        cursor: 'pointer',
      },
    },
    series: [
      // Blood glucose:
      getSeries(
        mergeEntriesFeed([
          models.filter(is('DexcomSensorEntry')),
          models.filter(is('DexcomRawSensorEntry')),
          models.filter(is('ParakeetSensorEntry')),
          models.filter(is('MeterEntry')),
        ]),
        Y_BG,
        'Blood glucose',
        model => 'bloodGlucose' in model && model.bloodGlucose, // <- plotted value
        { color: '#5bc0de' },
      ),

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
    ],
    time: {
      useUTC: false, // somewhat unintuitively, this needs to be false when model.timestamp is milliseconds since epoch in UTC :shrug:
    },
    credits: {
      enabled: false,
    },
    tooltip: {
      enabled: false,
    },
    legend: {
      enabled: false,
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
