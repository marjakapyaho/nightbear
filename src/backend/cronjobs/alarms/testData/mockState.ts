import { Situation, State } from 'shared/types/analyser';

export function getMockState(situation?: Situation): State {
  const state = {
    BATTERY: false,
    OUTDATED: false,
    LOW: false,
    BAD_LOW: false,
    FALLING: false,
    COMPRESSION_LOW: false,
    HIGH: false,
    BAD_HIGH: false,
    RISING: false,
    PERSISTENT_HIGH: false,
  };

  if (!situation) {
    return state as State;
  }

  return Object.assign(state, { [situation]: true }) as State;
}
