import { Situation } from './analyser';

export type Alarm = {
  id: string;
  timestamp: number;
  situationType: Situation;
  isActive: boolean;
  deactivationTimestamp: number | null;
  alarmStates: AlarmState[];
};

export type AlarmState = {
  alarmLevel: number;
  validAfterTimestamp: number;
  ackedBy: string | null;
  pushoverReceipts: string[];
};
