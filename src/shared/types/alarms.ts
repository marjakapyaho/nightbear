import { Situation } from './analyser';

export type AlarmState = {
  id: string;
  alarmLevel: number;
  validAfterTimestamp: number;
  ackedBy: string | null;
  pushoverReceipts: string[];
};

export type Alarm = {
  id: string;
  timestamp: number;
  situationType: Situation;
  isActive: boolean;
  deactivatedAt: number | null;
  alarmStates: AlarmState[];
};
