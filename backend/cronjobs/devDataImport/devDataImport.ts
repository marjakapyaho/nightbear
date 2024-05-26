import axios from 'axios'
import { CronjobsJournal } from '../../db/cronjobsJournal/types'
import { Context } from '../../utils/api'
import { Cronjob } from '../../utils/cronjobs'
import { DateTime } from 'luxon'
import _ from 'lodash'
import { SensorEntry } from '@nightbear/shared'
import { isNotNullish, isNullish } from '@nightbear/shared'

export const devDataImport: Cronjob = async (
  context,
  _journal,
): Promise<Partial<CronjobsJournal> | void> => {
  const { log, config, db } = context

  if (!config.DEV_DATA_IMPORT_FROM_COUCHDB) {
    log(`Dev data import not configured, nothing to do`)
    return
  }

  const data = await fetchTimelineEntries(context, 5)

  let imported = 0
  let skipped = 0

  for (const d of data) {
    try {
      await db.createSensorEntries([d])
      imported++
    } catch (err) {
      if (
        err instanceof Error &&
        err.message.match(/duplicate key value violates unique constraint/)
      ) {
        skipped++
      } else {
        throw err
      }
    }
  }

  if (imported || skipped) {
    log(`Imported ${imported} entries, skipped ${skipped} which already existed`)
  }
}

const fetchTimelineEntries = async (context: Context, minutes: number) => {
  const { log, config } = context

  const encode = (x: string) => encodeURIComponent(JSON.stringify(x))
  // TODO: is this correct?
  const startKey = encode(`timeline/${DateTime.fromJSDate(new Date()).minus({ minutes }).toISO()}`)
  const endKey = encode(`timeline/_`)
  const url = `${config.DEV_DATA_IMPORT_FROM_COUCHDB}/_all_docs?startkey=${startKey}&endkey=${endKey}&include_docs=true`

  const response = await axios.get(url)

  const data = (response.data.rows as unknown[]).map(row => {
    const modelType = _.get(row, 'doc.modelType') as unknown
    const timestamp = _.get(row, 'doc.timestamp') as unknown
    const bloodGlucose = _.get(row, 'doc.bloodGlucose') as unknown
    if (
      modelType === 'DexcomG6ShareEntry' &&
      typeof timestamp === 'number' &&
      typeof bloodGlucose === 'number'
    ) {
      return {
        type: 'DEXCOM_G6_SHARE',
        timestamp: new Date(timestamp).toISOString(),
        bloodGlucose,
      } satisfies SensorEntry
    }
    return null
  })

  const dataUseful = data.filter(isNotNullish)
  const dataUseless = data.filter(isNullish)

  log(`Found ${dataUseful.length} entries to import, and ${dataUseless.length} to ignore`)

  return dataUseful
}
