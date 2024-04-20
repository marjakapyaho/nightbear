import { Situation } from './analyser';

export type AlarmState = {
  alarmLevel: number;
  validAfterTimestamp: string;
  ackedBy: string | null;
  pushoverReceipts: string[];
};

export type Alarm = {
  id: string;
  timestamp: string;
  situation: Situation;
  isActive: boolean;
  deactivatedAt: string | null;
  alarmStates: AlarmState[];
};
