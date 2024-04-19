import axios, { AxiosError } from 'axios';
import { Logger, extendLogger } from 'shared/utils/logging';
import { pick } from 'lodash';

const DEXCOM_APPLICATION_ID = 'd8665ade-9673-4e27-9ff6-92db4ce13d13';

export type DexcomShareClient = ReturnType<typeof createDexcomShareClient>;

export type DexcomShareResponse = { DT: string; ST: string; Trend: number; Value: number; WT: string };

export const NO_DEXCOM_SHARE: DexcomShareClient = {
  login: () => Promise.resolve(''),
  fetchBg: () => Promise.resolve([]),
};

export function createDexcomShareClient(username: string, password: string, logger: Logger) {
  const log = extendLogger(logger, 'dexcom-share');

  log('DexcomShareClient initialized');

  return {
    login(): Promise<string> {
      return axios
        .post(
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
        .then(res => {
          if (res.data === '00000000-0000-0000-0000-000000000000') {
            throw new Error(`DexcomShareClient login request failed due to invalid credentials`);
          } else {
            return res.data;
          }
        })
        .catch((err: AxiosError) => {
          if (err.isAxiosError)
            log('Login request failed:\n%O', pick(err.response, 'data', 'status', 'statusText', 'headers'));
          return Promise.reject(new Error(`DexcomShareClient login request failed (caused by\n${err}\n)`));
        });
    },
    fetchBg(sessionId: string): Promise<Array<DexcomShareResponse>> {
      return axios
        .post(
          `https://shareous1.dexcom.com/ShareWebServices/Services/Publisher/ReadPublisherLatestGlucoseValues?sessionId=${sessionId}&minutes=1440&maxCount=1`,
          undefined,
          {
            headers: {
              Accept: 'application/json',
              'User-Agent': 'Dexcom Share/3.0.2.11 CFNetwork/711.2.23 Darwin/14.0.0',
            },
          },
        )
        .then(res => res.data)
        .catch((err: AxiosError) => {
          if (err.isAxiosError)
            log('BG fetch request failed:\n%O', pick(err.response, 'data', 'status', 'statusText', 'headers'));
          return Promise.reject(new Error(`DexcomShareClient BG fetch request failed (caused by\n${err}\n)`));
        });
    },
  };
}
