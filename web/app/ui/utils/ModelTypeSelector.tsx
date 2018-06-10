import { renderFromProps } from 'nightbear/web/app/utils/react';
import { TimelineModelType } from 'nightbear/core/models/model';

const options: TimelineModelType[] = ['ParakeetSensorEntry', 'DexcomSensorEntry'];

export default renderFromProps<{ onChange: (newValue: TimelineModelType) => void }>(
  __filename,
  (React, props) => (
    <div className="this">
      <select onChange={event => props.onChange(event.target.value as TimelineModelType)}>
        {options.map(value => (
          <option key={value} value={value}>
            {value}
          </option>
        ))}
      </select>
    </div>
  ),
);
