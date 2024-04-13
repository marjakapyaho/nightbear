import { State } from 'shared/types/analyser';

export const DEFAULT_STATE: State = {
  OUTDATED: false,
  FALLING: false,
  RISING: false,
  LOW: false,
  BAD_LOW: false,
  COMPRESSION_LOW: false,
  HIGH: false,
  BAD_HIGH: false,
  PERSISTENT_HIGH: false,
};
