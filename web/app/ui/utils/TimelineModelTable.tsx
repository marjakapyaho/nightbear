import { TimelineModel } from 'core/models/model';
import { get, reverse, sortBy } from 'lodash';
import Timestamp from 'web/app/ui/utils/Timestamp';
import { renderFromProps } from 'web/app/utils/react';

export default renderFromProps<{ models: TimelineModel[] }>(__filename, (React, props) => {
  if (props.models.length === 0) {
    return <div className="this">(no data to show)</div>;
  } else {
    const columns = Object.keys(props.models.reduce((memo, next) => ({ ...memo, ...next }), {}));
    return (
      <div className="this">
        <table>
          <thead>
            <tr>{renderThs(columns)}</tr>
          </thead>
          <tbody>
            {reverse(sortBy(props.models, 'timestamp')).map((model, i) => (
              <tr key={i}>{renderTds(columns, model)}</tr>
            ))}
          </tbody>
        </table>
        <p>{props.models.length} models shown</p>
      </div>
    );
  }

  function renderThs(columns: string[]): JSX.Element[] | null {
    return columns.map(key => <th key={key}>{key}</th>);
  }

  function renderTds(columns: string[], model: TimelineModel): JSX.Element[] {
    return columns.map(key => <td key={key}>{renderValue(get(model, key, ''))}</td>);
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
    } else if (val === null) {
      return <code>null</code>;
    } else if (typeof val === 'boolean') {
      return <code>{val ? 'true' : 'false'}</code>;
    } else if (typeof val === 'object') {
      return <span title={JSON.stringify(val, null, 4)}>[object]</span>;
    } else {
      return `[${typeof val}]`;
    }
  }
});
