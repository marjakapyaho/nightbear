import axios from 'axios';
// @ts-ignore
import Pushover from 'pushover-notifications';
import { Situation } from 'shared/types/analyser';
import { Logger, extendLogger } from 'backend/utils/logging';

export type PushoverClient = ReturnType<typeof createPushoverClient>;

export const NO_PUSHOVER: PushoverClient = {
  sendAlarm: () => Promise.resolve(''),
  ackAlarms: () => Promise.resolve(null),
};

export function createPushoverClient(
  user: string,
  token: string,
  callbackUrl: string,
  logger: Logger,
) {
  const api = new Pushover({ user, token });
  const log = extendLogger(logger, 'pushover');

  // TODO: remove null when db returns only undefined
  return {
    sendAlarm(situation: Situation, recipient?: string | null): Promise<string | null> {
      if (!recipient) {
        return Promise.resolve(null);
      }

      const message = {
        title: 'Nightbear alarm',
        sound: 'persistent',
        message: situation,
        device: recipient,
        priority: 2,
        retry: 30,
        expire: 10800,
        callback: callbackUrl,
      };

      return new Promise((resolve, reject) => {
        api.send(message, (err: object, result: string) => {
          if (err) {
            log('Could not send alarm:', err);
            return reject(err);
          }
          const receipt: string = JSON.parse(result).receipt;
          log('Alarm sent with receipt:', receipt);
          resolve(receipt);
        });
      });
    },

    ackAlarms(receipts: string[] = []): Promise<null> {
      return Promise.all(
        receipts.map(receipt => {
          return axios.post(
            'https://api.pushover.net/1/receipts/' + receipt + '/cancel.json',
            'token=' + encodeURIComponent(token),
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
          );
        }),
      ).then(() => null);
    },
  };
}
