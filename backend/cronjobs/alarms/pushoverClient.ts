// @ts-ignore
// @ts-ignore

import axios from 'axios';
// @ts-ignore
import Pushover from 'pushover-notifications';
import { Situation } from '@nightbear/shared';
import { Logger, extendLogger } from '../../utils/logging';

export type PushoverClient = ReturnType<typeof createPushoverClient>;

export const NO_PUSHOVER: PushoverClient = {
  sendAlarm: async () => undefined,
  ackAlarms: async () => [],
};

export const createPushoverClient = (
  user: string,
  token: string,
  callbackUrl: string,
  logger: Logger,
) => {
  const api = new Pushover({ user, token });
  const log = extendLogger(logger, 'pushover');

  return {
    async sendAlarm(situation: Situation, recipient: string) {
      const message = {
        title: 'Nightbear alarm',
        sound: 'persistent',
        message: situation,
        device: recipient,
        priority: 2,
        retry: 30,
        expire: 10800,
        callback: `${callbackUrl}?ackedBy=pushover:${recipient}`,
      };

      return api.send(message, (err: object, result: string) => {
        if (err) {
          log('Could not send alarm:', err);
          return err;
        }

        const receipt: string = JSON.parse(result).receipt;
        log('Alarm sent with receipt:', receipt);

        return receipt;
      });
    },

    async ackAlarms(receipts: string[] = []) {
      return Promise.all(
        receipts.map(receipt => {
          log('Acking alarm with receipt:', receipt);

          return axios.post(
            'https://api.pushover.net/1/receipts/' + receipt + '/cancel.json',
            'token=' + encodeURIComponent(token),
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
          );
        }),
      );
    },
  };
};
