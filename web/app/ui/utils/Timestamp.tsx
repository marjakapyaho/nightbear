import * as React from 'react';
import { DateTime, Duration } from 'luxon';
import { HOUR_IN_MS, DAY_IN_MS } from 'core/calculations/calculations';

const LIVE_FORMAT_AGE_LIMIT = HOUR_IN_MS;
const FULL_FORMAT_AGE_LIMIT = DAY_IN_MS * 0.5;

const ns = 'TODO';

type Props = { ts: number };

export default class Timestamp extends React.Component<Props> {
  slowTimer: NodeJS.Timer | null;
  fastTimer: NodeJS.Timer | null;

  constructor(props: Props) {
    super(props);
  }

  _getLiveAge(): number | null {
    const delta = Date.now() - this.props.ts;
    return delta <= LIVE_FORMAT_AGE_LIMIT ? delta : null; // return null if we shouldn't have a live age anymore
  }

  _reconsiderTimer() {
    const liveAge = this._getLiveAge();
    if (liveAge !== null && !this.fastTimer) {
      this.fastTimer = global.setInterval(() => this.forceUpdate(), 1000);
      this.forceUpdate();
    } else if (liveAge === null && this.fastTimer) {
      global.clearInterval(this.fastTimer);
      this.fastTimer = null;
      this.forceUpdate();
    }
  }

  _getFormattedOutput(): string {
    const liveAge = this._getLiveAge();
    if (liveAge !== null) {
      return Duration.fromMillis(liveAge).toFormat("mm:ss 'ago'"); // https://moment.github.io/luxon/docs/manual/formatting.html#table-of-tokens
    }
    const age = Date.now() - this.props.ts;
    if (age < FULL_FORMAT_AGE_LIMIT) {
      return DateTime.fromMillis(this.props.ts).toFormat('HH:mm:ss'); // https://moment.github.io/luxon/docs/manual/formatting.html#table-of-tokens
    } else {
      return DateTime.fromMillis(this.props.ts).toLocaleString(DateTime.DATETIME_SHORT);
    }
  }

  componentDidMount() {
    this.slowTimer = global.setInterval(() => this.forceUpdate(), HOUR_IN_MS); // re-evaluate once per hour, regardless of live formatting, so stuff like "today" vs "yesterday" works
    this._reconsiderTimer();
  }

  componentDidUpdate() {
    this._reconsiderTimer();
  }

  componentWillUnmount() {
    if (this.slowTimer) global.clearInterval(this.slowTimer);
    if (this.fastTimer) global.clearInterval(this.fastTimer);
    this.slowTimer = null;
    this.fastTimer = null;
  }

  render() {
    const fullDate = DateTime.fromMillis(this.props.ts).toLocaleString(
      DateTime.DATETIME_FULL_WITH_SECONDS,
    );
    return (
      <span className={ns} title={fullDate}>
        {this._getFormattedOutput()}
      </span>
    );
  }
}
