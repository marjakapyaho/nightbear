import axios from 'axios';
import { Logger, extendLogger } from 'core/utils/logging';

const DEXCOM_APPLICATION_ID = 'd8665ade-9673-4e27-9ff6-92db4ce13d13';

export type DexcomShareClient = ReturnType<typeof createDexcomShareClient>;

export function createDexcomShareClient(username: string, password: string, logger: Logger) {
  const log = extendLogger(logger, 'dexcom-share');

  log('Init dexcom share');

  return {
    login(): Promise<string> {
      return axios.post(
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
      );
    },
    fetchBgData(sessionId: string): Promise<any> {
      return axios.post(
        `https://shareous1.dexcom.com/ShareWebServices/Services/Publisher/ReadPublisherLatestGlucoseValues?sessionId=${sessionId}&minutes=1440&maxCount=1`,
        '',
        {
          headers: {
            Accept: 'application/json',
            'User-Agent': 'Dexcom Share/3.0.2.11 CFNetwork/711.2.23 Darwin/14.0.0',
          },
        },
      );
    },
  };
}
