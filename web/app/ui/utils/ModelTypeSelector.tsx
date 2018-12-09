import { TimelineModelType } from 'core/models/model';
import { isNotNull } from 'server/utils/types';
import { renderFromProps } from 'web/app/utils/react';

const options: TimelineModelType[] = [
  'DexcomSensorEntry',
  'DexcomRawSensorEntry',
  'ParakeetSensorEntry',
  'DexcomCalibration',
  'NightbearCalibration',
  'DeviceStatus',
  'Hba1c',
  'MeterEntry',
  'Insulin',
  'Carbs',
];

export default renderFromProps<{
  multiple?: boolean;
  onChange: (newValues: TimelineModelType[]) => void;
}>(__filename, (React, { multiple, onChange }) => (
  <div className="this">
    <select
      multiple={multiple}
      onChange={event => {
        if (multiple) {
          onChange(
            (Array.prototype.slice.call(event.target.options) as HTMLOptionElement[])
              .map(option => (option.selected ? (option.value as TimelineModelType) : null))
              .filter(isNotNull),
          );
        } else {
          onChange([event.target.value as TimelineModelType]);
        }
      }}
    >
      {options.map(value => (
        <option key={value} value={value}>
          {value}
        </option>
      ))}
    </select>
  </div>
));
