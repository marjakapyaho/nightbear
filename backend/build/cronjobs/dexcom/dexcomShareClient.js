"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDexcomShareClient = exports.NO_DEXCOM_SHARE = void 0;
const axios_1 = __importDefault(require("axios"));
const logging_1 = require("../../utils/logging");
const lodash_1 = require("lodash");
const DEXCOM_APPLICATION_ID = 'd8665ade-9673-4e27-9ff6-92db4ce13d13';
exports.NO_DEXCOM_SHARE = {
    login: () => Promise.resolve(''),
    fetchBg: () => Promise.resolve([]),
};
function createDexcomShareClient(username, password, logger) {
    const log = (0, logging_1.extendLogger)(logger, 'dexcom-share');
    log('DexcomShareClient initialized');
    return {
        login() {
            return axios_1.default
                .post('https://shareous1.dexcom.com/ShareWebServices/Services/General/LoginPublisherAccountByName', {
                accountName: username,
                applicationId: DEXCOM_APPLICATION_ID,
                password: password,
            }, {
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'User-Agent': 'Dexcom Share/3.0.2.11 CFNetwork/711.2.23 Darwin/14.0.0',
                },
            })
                .then(res => {
                if (res.data === '00000000-0000-0000-0000-000000000000') {
                    throw new Error(`DexcomShareClient login request failed due to invalid credentials`);
                }
                else {
                    return res.data;
                }
            })
                .catch((err) => {
                if (err.isAxiosError)
                    log('Login request failed:\n%O', (0, lodash_1.pick)(err.response, 'data', 'status', 'statusText', 'headers'));
                return Promise.reject(new Error(`DexcomShareClient login request failed (caused by\n${err}\n)`));
            });
        },
        fetchBg(sessionId) {
            return axios_1.default
                .post(`https://shareous1.dexcom.com/ShareWebServices/Services/Publisher/ReadPublisherLatestGlucoseValues?sessionId=${sessionId}&minutes=1440&maxCount=1`, undefined, {
                headers: {
                    Accept: 'application/json',
                    'User-Agent': 'Dexcom Share/3.0.2.11 CFNetwork/711.2.23 Darwin/14.0.0',
                },
            })
                .then(res => res.data)
                .catch((err) => {
                if (err.isAxiosError)
                    log('BG fetch request failed:\n%O', (0, lodash_1.pick)(err.response, 'data', 'status', 'statusText', 'headers'));
                return Promise.reject(new Error(`DexcomShareClient BG fetch request failed (caused by\n${err}\n)`));
            });
        },
    };
}
exports.createDexcomShareClient = createDexcomShareClient;
//# sourceMappingURL=dexcomShareClient.js.map