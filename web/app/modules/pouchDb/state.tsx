export type ReplicationDirection = 'UP' | 'DOWN';
export type PouchDbStatePart = ReplicationDirection | 'LOCAL';
export type PouchDbStatus = 'DISABLED' | 'ACTIVE' | 'ONLINE' | 'OFFLINE' | 'ERROR';

export type PouchDbState = Readonly<
  {
    [part in PouchDbStatePart]: {
      status: PouchDbStatus;
      details: string | [number, number];
    }
  }
>;

export const pouchDbInitState: PouchDbState = {
  LOCAL: {
    status: 'DISABLED',
    details: '',
  },
  UP: {
    status: 'DISABLED',
    details: '',
  },
  DOWN: {
    status: 'DISABLED',
    details: '',
  },
};
