import { useCssNs } from 'web/utils/react';

const options = [
  ['1 hour', 1000 * 60 * 60 * 1],
  ['4 hours', 1000 * 60 * 60 * 4],
  ['12 hours', 1000 * 60 * 60 * 12],
  ['day', 1000 * 60 * 60 * 24],
  ['3 days', 1000 * 60 * 60 * 24 * 3],
  ['week', 1000 * 60 * 60 * 24 * 7],
  ['2 weeks', 1000 * 60 * 60 * 24 * 7 * 2],
  ['3 weeks', 1000 * 60 * 60 * 24 * 7 * 3],
  ['month', 1000 * 60 * 60 * 24 * 30],
  ['2 months', 1000 * 60 * 60 * 24 * 30 * 2],
  ['3 months', 1000 * 60 * 60 * 24 * 30 * 3],
  ['6 months', 1000 * 60 * 60 * 24 * 30 * 6],
  ['year', 1000 * 60 * 60 * 24 * 30 * 12],
];

type Props = {
  value?: number;
  onChange: (newRange: number) => void;
  prefix?: string;
  suffix?: string;
};

export default (props => {
  const { React } = useCssNs('TimeRangeSelector');

  return (
    <div className="this">
      <select value={props.value} onChange={event => props.onChange(parseInt(event.target.value, 10))}>
        {typeof props.value !== 'undefined' && !options.find(([, v]) => v === props.value) && (
          <option value={props.value}>custom</option>
        )}
        {options.map(([title, value]) => (
          <option key={value} value={value}>
            {props.prefix} {title} {props.suffix}
          </option>
        ))}
      </select>
    </div>
  );
}) as React.FC<Props>;
