import { DexcomShareResponse, NO_DEXCOM_SHARE } from './dexcomShareClient'
import { mapDexcomShareResponseToSensorEntry } from './utils'
import { CronjobsJournal } from '../../db/cronjobsJournal/types'
import { Cronjob } from '../../utils/cronjobs'
import { isArray } from 'lodash'
import { MIN_IN_MS } from '@nightbear/shared'
import {
  getTimeAsISOStr,
  getTimeInMillis,
  humanReadableLongTime,
  isTimeLarger,
} from '@nightbear/shared'

export const dexcomShare: Cronjob = async (
  context,
  journal,
): Promise<Partial<CronjobsJournal> | void> => {
  const { log, dexcomShare, config } = context

  if (dexcomShare === NO_DEXCOM_SHARE) {
    log(`Dexcom share not enabled`)
    return
  }

  const { dexcomShareSessionId, dexcomShareLoginAttemptAt } = journal
  const dexcomShareLoginAttemptTimestamp =
    dexcomShareLoginAttemptAt && getTimeInMillis(dexcomShareLoginAttemptAt)
  const mins = config.DEXCOM_SHARE_LOGIN_ATTEMPT_DELAY_MINUTES || 60
  const loginAttemptAllowed =
    !dexcomShareLoginAttemptTimestamp ||
    isTimeLarger(Date.now() - dexcomShareLoginAttemptTimestamp, MIN_IN_MS * mins)

  if (dexcomShareSessionId) {
    let latestBg
    try {
      latestBg = await context.db.getLatestSensorEntry()

      if (latestBg) {
        const ageInMin = (Date.now() - getTimeInMillis(latestBg.timestamp)) / MIN_IN_MS
        const ageModulo = ageInMin % 5
        const willFetch =
          ageModulo > 0.35 && // new BG's aren't visible on Dexcom Share immediately → give it a bit of time
          ageModulo < 1.75 && // not within the time window where new BG's appear → no point in fetching until a new one may be available again
          ageInMin >= 4.5 // our fetch window is slightly larger than 1 minute, to ensure slight scheduling wobble of the cronjob doesn't cause fetches to be skipped → need a mechanism for preventing the opposite (i.e. unnecessary consecutive fetches)

        log(
          `Time since last BG is ${ageInMin.toFixed(1)} min → ${
            willFetch ? 'WILL' : "won't"
          } fetch BG`,
        )

        if (!willFetch) return
      }
    } catch (err) {
      if (
        err instanceof Error &&
        err.message.match(/Expected exactly one result row but got 0 instead/)
      ) {
        log(`Assuming this is the first time ever we're trying to fetch BG`)
      } else {
        throw err // something else is wrong, and it might not be safe to proceed (continuous error loop for example)
      }
    }

    try {
      const res = await dexcomShare.fetchBg(dexcomShareSessionId)
      const model = parseIncomingBg(res)
      const lagInMin = (Date.now() - getTimeInMillis(model.timestamp)) / MIN_IN_MS
      const desc = `BG ${model.bloodGlucose}, timestamp ${humanReadableLongTime(model.timestamp)}`

      log(`BG lag is ${lagInMin.toFixed(1)} min (may include clock drift)`)

      if (latestBg && latestBg.timestamp === model.timestamp) {
        log(`This entry already exists: ${desc}`) // already exists in the DB → no need to do anything!
      } else {
        await context.db.createSensorEntry(model) // we didn't find the entry yet → create it
        log(`Saved new SensorEntry: ${desc}`)
      }
    } catch (err) {
      log(`Could not fetch BG (caused by\n${err}\n), will mark the session as needing refresh`)
      return {
        dexcomShareSessionId: null,
      }
    }
  } else {
    if (loginAttemptAllowed) {
      log('No session, will attempt login')
      try {
        const dexcomShareSessionId = await dexcomShare.login()
        log('Login was successful, BG will be fetched on the next round')
        return {
          dexcomShareSessionId,
          dexcomShareLoginAttemptAt: new Date().toISOString(),
        }
      } catch (err) {
        log(`Login attempt failed (caused by\n${err}\n)`)
        return {
          dexcomShareLoginAttemptAt: new Date().toISOString(),
        }
      }
    } else {
      const readableTime = dexcomShareLoginAttemptTimestamp
        ? humanReadableLongTime(getTimeAsISOStr(dexcomShareLoginAttemptTimestamp))
        : 'n/a'
      log(
        `No session, will NOT attempt login, last attempt was at ${readableTime}, too soon (under ${mins} min)`,
      )
    }
  }
}

function parseIncomingBg(res: DexcomShareResponse[]) {
  if (!isArray(res)) throw new Error(`Unexpected response payload: ${typeof res}`)
  if (res.length !== 1) throw new Error(`Unexpected response length: ${res.length}`)
  const [val] = res
  return mapDexcomShareResponseToSensorEntry(val)
}
