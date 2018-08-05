import { renderFromStore } from 'web/app/utils/react';
import * as Highcharts from 'highcharts';
import * as HighchartsReact from 'highcharts-react-official';

const options: Highcharts.Options = {
  title: {
    text: 'My chart',
  },
  series: [
    {
      data: [1, 2, 3],
    },
  ],
};

export default renderFromStore(
  __filename,
  state => state,
  React => (
    <div className="this">
      <HighchartsReact highcharts={Highcharts} options={options} />
    </div>
  ),
);
