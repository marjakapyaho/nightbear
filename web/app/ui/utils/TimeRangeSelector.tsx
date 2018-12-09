import { renderFromProps } from 'web/app/utils/react';

const options = [
  ['1 hour', 1000 * 60 * 60 * 1],
  ['12 hours', 1000 * 60 * 60 * 12],
  ['day', 1000 * 60 * 60 * 24],
  ['week', 1000 * 60 * 60 * 24 * 7],
  ['2 weeks', 1000 * 60 * 60 * 24 * 7 * 2],
  ['3 weeks', 1000 * 60 * 60 * 24 * 7 * 3],
  ['month', 1000 * 60 * 60 * 24 * 30],
  ['2 months', 1000 * 60 * 60 * 24 * 30 * 2],
  ['3 months', 1000 * 60 * 60 * 24 * 30 * 3],
  ['6 months', 1000 * 60 * 60 * 24 * 30 * 6],
  ['year', 1000 * 60 * 60 * 24 * 30 * 12],
];

export default renderFromProps<{ onChange: (newRange: number) => void }>(
  __filename,
  (React, props) => (
    <div className="this">
      <select onChange={event => props.onChange(parseInt(event.target.value, 10))}>
        {options.map(([title, value]) => (
          <option key={value} value={value}>
            Last {title}
          </option>
        ))}
      </select>
    </div>
  ),
);
