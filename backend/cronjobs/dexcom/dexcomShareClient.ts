import axios, { AxiosError } from 'axios'
import { pick } from 'lodash'
import { Logger, extendLogger } from '../../utils/logging'

const DEXCOM_APPLICATION_ID = 'd8665ade-9673-4e27-9ff6-92db4ce13d13'

export type DexcomShareClient = ReturnType<typeof createDexcomShareClient>

export type DexcomShareResponse = {
  DT: string
  ST: string
  Trend: number
  Value: number
  WT: string
}

export const NO_DEXCOM_SHARE: DexcomShareClient = {
  login: () => Promise.resolve(''),
  fetchBg: () => Promise.resolve([]),
}

export function createDexcomShareClient(username: string, password: string, logger: Logger) {
  const log = extendLogger(logger, 'dexcom-share')

  log('DexcomShareClient initialized')

  return {
    async login() {
      try {
        const res = await axios.post(
          'https://shareous1.dexcom.com/ShareWebServices/Services/General/LoginPublisherAccountByName',
          {
            accountName: username,
            applicationId: DEXCOM_APPLICATION_ID,
            password: password,
          },
          {
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
              'User-Agent': 'Dexcom Share/3.0.2.11 CFNetwork/711.2.23 Darwin/14.0.0',
            },
          },
        )

        if (res.data === '00000000-0000-0000-0000-000000000000') {
          throw new Error(`DexcomShareClient login request failed due to invalid credentials`)
        } else {
          return String(res.data)
        }
      } catch (err) {
        if (err instanceof AxiosError) {
          log(
            'Login request failed:\n%O',
            pick(err.response, 'data', 'status', 'statusText', 'headers'),
          )
        }
        throw new Error(`DexcomShareClient login request failed (caused by\n${String(err)}\n)`)
      }
    },
    async fetchBg(sessionId: string) {
      try {
        const res = await axios.post(
          `https://shareous1.dexcom.com/ShareWebServices/Services/Publisher/ReadPublisherLatestGlucoseValues?sessionId=${sessionId}&minutes=1440&maxCount=1`,
          undefined,
          {
            headers: {
              Accept: 'application/json',
              'User-Agent': 'Dexcom Share/3.0.2.11 CFNetwork/711.2.23 Darwin/14.0.0',
            },
          },
        )
        return res.data as unknown as DexcomShareResponse[]
      } catch (err) {
        if (err instanceof AxiosError) {
          log(
            'BG fetch request failed:\n%O',
            pick(err.response, 'data', 'status', 'statusText', 'headers'),
          )
        }
        throw new Error(`DexcomShareClient BG fetch request failed (caused by\n${String(err)}\n)`)
      }
    },
  }
}
