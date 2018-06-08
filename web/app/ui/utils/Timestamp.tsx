import { renderFromProps } from 'nightbear/web/app/utils/react';
import { padStart } from 'lodash';

export default renderFromProps<{ ts: number }>(__filename, (React, props) => {
  const d = new Date(props.ts);
  const today = formatDate(new Date());
  const date = formatDate(d);
  const time = formatTime(d);
  return (
    <div className="this" title={d.toString()}>
      {date === today ? '' : date} {time}
    </div>
  );
});

function formatDate(d: Date) {
  return `${d.getDay()}.${d.getMonth() + 1}.${d.getFullYear()}`;
}

function formatTime(d: Date) {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function pad(num: number): string {
  return padStart(num + '', 2, '0');
}
