import { TimelineModel } from 'nightbear/core/models/model';
import { renderFromProps } from 'nightbear/web/app/utils/react';
import { objectKeys } from 'nightbear/web/app/utils/types';

export default renderFromProps<{ models: TimelineModel[] }>(__filename, (React, props) => {
  if (props.models.length === 0) {
    return <div className="this">(no data to show)</div>;
  } else {
    return (
      <div className="this">
        <table>
          <thead>
            <tr>{renderThs(props.models[0])}</tr>
          </thead>
          <tbody>{props.models.map((model, i) => <tr key={i}>{renderTds(model)}</tr>)}</tbody>
        </table>
      </div>
    );
  }

  function renderThs(model: TimelineModel): JSX.Element[] {
    return objectKeys(model).map(key => <th key={key}>{key}</th>);
  }

  function renderTds(model: TimelineModel): JSX.Element[] {
    return objectKeys(model).map(key => <td key={key}>{renderValue(model[key])}</td>);
  }

  function renderValue(val: any): string {
    if (typeof val === 'string') return val;
    if (typeof val === 'number') return val + '';
    if (typeof val === 'object') return '[object]';
    return `[${typeof val}]`;
  }
});
