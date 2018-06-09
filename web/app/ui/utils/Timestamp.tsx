import * as React from 'react';
import { padStart } from 'lodash';

const ns = 'TODO';

type Props = { ts: number };

export default class Clock extends React.Component<Props> {
  timerID: NodeJS.Timer;

  constructor(props: Props) {
    super(props);
  }

  componentDidMount() {
    this.timerID = global.setInterval(() => this.forceUpdate(), 1000);
  }

  componentWillUnmount() {
    global.clearInterval(this.timerID);
  }

  render() {
    const d = new Date(this.props.ts);
    const now = Date.now();
    const today = formatDate(new Date(now));
    const date = formatDate(d);
    const time = formatTime(d);
    let output = '';
    if (date !== today) {
      output = `${date} ${time}`;
    } else if (d.getTime() > now - 1000 * 60) {
      output = ((now - d.getTime()) / 1000).toFixed(0) + ' sec ago';
    } else if (d.getTime() > now - 1000 * 60 * 60) {
      output = ((now - d.getTime()) / (1000 * 60)).toFixed(1) + ' min ago';
    } else {
      output = time;
    }
    return (
      <div className={ns} title={d.toString()}>
        {output}
      </div>
    );
  }
}

function formatDate(d: Date) {
  return `${d.getDay()}.${d.getMonth() + 1}.${d.getFullYear()}`;
}

function formatTime(d: Date) {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function pad(num: number): string {
  return padStart(num + '', 2, '0');
}
