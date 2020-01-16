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
  }
}) as React.FC<Props>;
