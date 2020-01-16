import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import HighchartsMore from 'highcharts/highcharts-more'; // for e.g. chart type "bubble"
import HighchartsAnnotations from 'highcharts/modules/annotations';
import React from 'react';

HighchartsAnnotations(Highcharts);
HighchartsMore(Highcharts);

type Props = {
  options: Highcharts.Options;
};

export default (props => {
  return <HighchartsReact highcharts={Highcharts} options={props.options} />;
}) as React.FC<Props>;
