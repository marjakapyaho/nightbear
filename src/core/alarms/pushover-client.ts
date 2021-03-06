import axios from 'axios';
import { Situation } from 'core/models/model';
import Pushover from 'pushover-notifications';
import { Logger, extendLogger } from 'core/utils/logging';

export type PushoverClient = ReturnType<typeof createPushoverClient>;

export const NO_PUSHOVER: PushoverClient = {
  sendAlarm: () => Promise.resolve(''),
  ackAlarms: () => Promise.resolve(null),
};

export function createPushoverClient(user: string, token: string, callbackUrl: string, logger: Logger) {
  const api = new Pushover({ user, token });
  const log = extendLogger(logger, 'pushover');

  return {
    sendAlarm(situationType: Situation, recipient: string): Promise<string> {
      const message = {
        title: 'Nightbear alarm',
        sound: 'persistent',
        message: situationType,
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
