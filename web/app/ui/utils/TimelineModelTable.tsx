import { TimelineModel } from 'nightbear/core/models/model';
import { renderFromProps } from 'nightbear/web/app/utils/react';
import { objectKeys } from 'nightbear/web/app/utils/types';
import Timestamp from 'nightbear/web/app/ui/utils/Timestamp';

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

  function renderValue(val: any): string | JSX.Element {
    if (typeof val === 'string') {
      return val;
    } else if (typeof val === 'number') {
      if (val > 1262300400000 && val < 1893452400000) {
        return <Timestamp ts={val} />; // when interpreted as a timestamp, after 2010 but before 2030
      } else {
        return val + '';
      }
    } else if (typeof val === 'object') {
      return <span title={JSON.stringify(val, null, 4)}>[object]</span>;
    } else {
      return `[${typeof val}]`;
    }
  }
});
