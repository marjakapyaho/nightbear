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

export default (({ value, onChange, prefix, suffix }) => {
  const { React } = useCssNs(module.id);

  return (
    <div className="this">
      <select value={value} onChange={event => onChange(parseInt(event.target.value, 10))}>
        {typeof value !== 'undefined' && !options.find(([, v]) => v === value) && <option value={value}>custom</option>}
        {options.map(([title, value]) => (
          <option key={value} value={value}>
            {prefix} {title} {suffix}
          </option>
        ))}
      </select>
    </div>
  );
}) as React.FC<Props>;
