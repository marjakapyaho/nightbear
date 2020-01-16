import Highcharts from 'highcharts';
import HighchartsMore from 'highcharts/highcharts-more'; // for e.g. chart type "bubble"
import HighchartsAnnotations from 'highcharts/modules/annotations';
import React, { useEffect, useRef } from 'react';

HighchartsAnnotations(Highcharts);
HighchartsMore(Highcharts);

type Props = {
  options: Highcharts.Options;
};

export default (props => {
  const chartRef = useRef<Highcharts.Chart | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  useEffect(manageChartExistence, []);
  useEffect(manageChartUpdates, [props.options]);

  return <div ref={containerRef} />;

  function manageChartExistence() {
    if (!containerRef.current) return;
    chartRef.current = new Highcharts.Chart(containerRef.current, props.options);
    return () => {
      if (!chartRef.current) return;
      chartRef.current.destroy();
      chartRef.current = null;
    };
  }

  function manageChartUpdates() {
    if (!chartRef.current) return;
    chartRef.current.update(props.options);
    issue8862Workaround(chartRef.current);
  }
}) as React.FC<Props>;

// https://github.com/highcharts/highcharts/issues/8862
function issue8862Workaround(chart: any) {
  if (!chart.options.chart.scrollablePlotArea) return; // https://github.com/highcharts/highcharts/issues/8862#issuecomment-575093026
  var H = Highcharts,
    fixedRenderer = chart.fixedRenderer;
  [
    chart.inverted ? '.highcharts-xaxis' : '.highcharts-yaxis',
    chart.inverted ? '.highcharts-xaxis-labels' : '.highcharts-yaxis-labels',
    '.highcharts-contextbutton',
    '.highcharts-credits',
    '.highcharts-legend',
    '.highcharts-subtitle',
    '.highcharts-title',
    '.highcharts-legend-checkbox',
  ].forEach(function(className) {
    H.each(chart.container.querySelectorAll(className), function(elem: any) {
      (elem.namespaceURI === fixedRenderer.SVG_NS ? fixedRenderer.box : fixedRenderer.box.parentNode).appendChild(elem);
      elem.style.pointerEvents = 'auto';
    });
  });
}
