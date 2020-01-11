import { TimelineModelType } from 'core/models/model';
import { isNotNull } from 'server/utils/types';
import { TIMELINE_MODEL_TYPES } from 'web/modules/uiNavigation/state';
import { useCssNs } from 'web/utils/react';

type Props = {
  multiple?: boolean;
  value?: TimelineModelType[];
  onChange: (newValues: TimelineModelType[]) => void;
};

export default (({ multiple, value, onChange }) => {
  const { React } = useCssNs(module.id);

  return (
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
        {TIMELINE_MODEL_TYPES.map(value => (
          <option key={value} value={value}>
            {value}
          </option>
        ))}
      </select>
    </div>
  );
}) as React.FC<Props>;
