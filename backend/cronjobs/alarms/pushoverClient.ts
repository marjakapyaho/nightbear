import { Situation } from '@nightbear/shared'
import axios from 'axios'
import _ from 'lodash'
import { Logger, extendLogger } from '../../utils/logging'

export type PushoverClient = ReturnType<typeof createPushoverClient>

export const NO_PUSHOVER: PushoverClient = {
  // eslint-disable-next-line @typescript-eslint/require-await
  sendAlarm: async () => 'NO_PUSHOVER: Mock receipt',
  ackAlarms: async () => {},
}

export const createPushoverClient = (
  user: string,
  token: string,
  callbackUrl: string,
  logger: Logger,
) => {
  const log = extendLogger(logger, 'pushover')

  return {
    async sendAlarm(situation: Situation, recipient: string) {
      try {
        const res = await axios.post('https://api.pushover.net/1/messages.json', {
          user,
          token,
          title: 'Nightbear alarm',
          sound: 'persistent',
          message: situation,
          device: recipient,
          priority: 2,
          retry: 30,
          expire: 10800,
          callback: `${callbackUrl}?ackedBy=pushover:${recipient}`,
        })
        const receipt = String(_.get(res, 'data.receipt'))
        log('Alarm sent with receipt:', receipt)
        return receipt
      } catch (err) {
        log('Could not send alarm:', err)
        throw err
      }
    },

    async ackAlarms(receipts: string[] = []) {
      log('Acking alarms with receipts:', receipts)
      await Promise.all(
        receipts.map(async receipt => {
          await axios.post('https://api.pushover.net/1/receipts/' + receipt + '/cancel.json', {
            token,
          })
          log('Acked alarm with receipt:', receipt)
        }),
      )
    },
  }
}
