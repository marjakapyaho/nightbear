import { Situation, State } from 'nightbear/server/models/model';

export function getMockState(situation?: Situation): State {
  const state = {
    BATTERY: false,
    OUTDATED: false,
    LOW: false,
    FALLING: false,
    COMPRESSION_LOW: false,
    HIGH: false,
    RISING: false,
    PERSISTENT_HIGH: false,
  };

  if (!situation) {
    return state as State;
  }

  return Object.assign(state, { [situation]: true }) as State;
}
