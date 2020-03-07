import { TimelineModelType } from 'core/models/model';
import { first } from 'lodash';
import { isNotNull } from 'server/utils/types';
import { TIMELINE_MODEL_TYPES } from 'web/modules/navigation/state';
import { useCssNs } from 'web/utils/react';

type Props = {
  multiple?: boolean;
  value?: TimelineModelType[];
  onChange: (newValues: TimelineModelType[]) => void;
};

export default (props => {
  const { React } = useCssNs('ModelTypeSelector');

  return (
    <div className="this">
      <select
        style={{ height: 200 }}
        multiple={props.multiple}
        value={props.multiple ? props.value || [] : first(props.value)}
        onChange={event => {
          if (props.multiple) {
            props.onChange(
              (Array.prototype.slice.call(event.target.options) as HTMLOptionElement[])
                .map(option => (option.selected ? (option.value as TimelineModelType) : null))
                .filter(isNotNull),
            );
          } else {
            props.onChange([event.target.value as TimelineModelType]);
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
