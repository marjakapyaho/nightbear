import { TimelineModelType } from 'core/models/model';
import { isNotNull } from 'server/utils/types';
import { renderFromProps } from 'web/app/utils/react';

const options: TimelineModelType[] = [
  'Sensor',
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
  'Alarm',
];

export default renderFromProps<{
  multiple?: boolean;
  value?: TimelineModelType[];
  onChange: (newValues: TimelineModelType[]) => void;
}>(__filename, (React, { multiple, value, onChange }) => (
  <div className="this">
    <select
      style={{ height: 200 }}
      multiple={multiple}
      value={value || []}
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
