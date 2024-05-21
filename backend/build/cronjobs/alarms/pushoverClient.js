"use strict";
// @ts-ignore
// @ts-ignore
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPushoverClient = exports.NO_PUSHOVER = void 0;
const axios_1 = __importDefault(require("axios"));
// @ts-ignore
const pushover_notifications_1 = __importDefault(require("pushover-notifications"));
const logging_1 = require("../../utils/logging");
exports.NO_PUSHOVER = {
    sendAlarm: async () => undefined,
    ackAlarms: async () => [],
};
const createPushoverClient = (user, token, callbackUrl, logger) => {
    const api = new pushover_notifications_1.default({ user, token });
    const log = (0, logging_1.extendLogger)(logger, 'pushover');
    return {
        async sendAlarm(situation, recipient) {
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
            return api.send(message, (err, result) => {
                if (err) {
                    log('Could not send alarm:', err);
                    return err;
                }
                const receipt = JSON.parse(result).receipt;
                log('Alarm sent with receipt:', receipt);
                return receipt;
            });
        },
        async ackAlarms(receipts = []) {
            return Promise.all(receipts.map(receipt => {
                log('Acking alarm with receipt:', receipt);
                return axios_1.default.post('https://api.pushover.net/1/receipts/' + receipt + '/cancel.json', 'token=' + encodeURIComponent(token), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
            }));
        },
    };
};
exports.createPushoverClient = createPushoverClient;
//# sourceMappingURL=pushoverClient.js.map