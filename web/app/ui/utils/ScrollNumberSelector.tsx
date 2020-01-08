import { renderFromProps } from 'web/app/utils/react';
import { range } from 'lodash';

export default renderFromProps<{
  value?: number;
  onChange: (newRange: number) => void;
  min: number;
  max: number;
  step: number;
}>(__filename, (React, props) => (
  <div className="this">
    {range(props.min, props.max + props.step, props.step).map((val, i) => (
      <div key={i}>{val}</div>
    ))}
  </div>
));
