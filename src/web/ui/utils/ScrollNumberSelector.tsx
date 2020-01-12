import { range } from 'lodash';
import 'web/ui/utils/ScrollNumberSelector.scss';
import { useCssNs } from 'web/utils/react';

type Props = {
  value?: number;
  onChange: (newRange: number) => void;
  min: number;
  max: number;
  step: number;
  centerOn?: number;
};

export default (props => {
  const { React } = useCssNs('ScrollNumberSelector');

  return (
    <div className="this">
      {range(props.min, props.max + props.step, props.step).map((val, i) => (
        <div key={i}>{val}</div>
      ))}
    </div>
  );
}) as React.FC<Props>;
