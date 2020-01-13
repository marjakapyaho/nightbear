import { range } from 'lodash';
import { renderFromProps } from 'web/app/utils/react';

export default renderFromProps<{
  value?: number;
  onChange: (newRange: number) => void;
  min: number;
  max: number;
  step: number;
  centerOn?: number;
}>(__filename, (React, props) => {
  return (
    <div className="this">
      {range(props.min, props.max + props.step, props.step).map((val, i) => (
        <div key={i}>{val}</div>
      ))}
    </div>
  );
});
