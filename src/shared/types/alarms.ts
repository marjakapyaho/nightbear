import { Situation } from './analyser';

export type AlarmState = {
  id: string;
  timestamp: string;
  alarmLevel: number;
  validAfter: string;
  ackedBy?: string | null; // TODO
  notificationTarget?: string | null; // TODO
  notificationReceipt?: string | null; // TODO
  notificationProcessedAt?: string | null; // TODO
};

export type Alarm = {
  id: string;
  situation: Situation;
  isActive: boolean;
  deactivatedAt?: string;
  alarmStates: AlarmState[];
};
