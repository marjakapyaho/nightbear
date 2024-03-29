export type ReplicationDirection = 'UP' | 'DOWN';
export type PouchDbStatePart = ReplicationDirection | 'LOCAL';
export type PouchDbStatus = 'DISABLED' | 'ACTIVE' | 'ONLINE' | 'OFFLINE' | 'ERROR';

export type PouchDbState = Readonly<{
  [part in PouchDbStatePart]: {
    status: PouchDbStatus;
    details: string | [number, number];
    lastChangedAt: number;
  };
}>;

export const pouchDbInitState: PouchDbState = {
  LOCAL: {
    status: 'DISABLED',
    details: '',
    lastChangedAt: Date.now(),
  },
  UP: {
    status: 'DISABLED',
    details: '',
    lastChangedAt: Date.now(),
  },
  DOWN: {
    status: 'DISABLED',
    details: '',
    lastChangedAt: Date.now(),
  },
};
