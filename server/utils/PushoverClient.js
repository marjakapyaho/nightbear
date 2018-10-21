import Pushover from 'pushover-notifications';
import axios from 'axios';
import _ from 'lodash';

export default function(logger, user, token) {

    const log = logger(__filename);
    const api = new Pushover({ user, token });
    
    return {
        
        sendAlarm(level, message, retry, expire, app) {
            let msg = {
                message,
                title: "NightBear alert",
                sound: 'persistent',
                device: process.env['PUSHOVER_LEVEL_1'], // TODO: Get rid of direct process.env reference
                priority: 2,
                retry,
                expire,
                callback: 'http://legacy.nightbear.fi/api/v1/status' // TODO: Make this configurable
            };

            if (level === 1) {
                msg.device = process.env['PUSHOVER_LEVEL_0'];
            }
            else if (level === 2) {
                msg.device = process.env['PUSHOVER_LEVEL_1'];
            }
            else if (level === 3) {
                msg.device = process.env['PUSHOVER_LEVEL_2'];
            }
            else if (level === 4) {
                msg.device = process.env['PUSHOVER_LEVEL_3'];
            }

/*            if (app.profile.getActiveProfileName() === 'night') {
                const copyOfMsg = _.assign({}, msg, { device: process.env['PUSHOVER_LEVEL_2'] });
                api.send(copyOfMsg, (err) => {
                    if (err) {
                        log.error('Could not send extra alarm:', err);
                    }
                    else {
                        log('Extra alarm sent without receipt');
                    }
                });
            }*/

            return new Promise((resolve, reject) => {
                api.send(msg, (err, result) => {
                    if (err) {
                        log.error('Could not send alarm:', err);
                        return reject(err);
                    }
                    let receipt = JSON.parse(result).receipt;
                    log('Alarm sent with receipt:', receipt);
                    resolve(receipt);
                });
            });
        },

        ackAlarms(receipts = []) {
            return Promise.all(receipts.map(receipt => {
                return axios.post(
                    'https://api.pushover.net/1/receipts/' + receipt + '/cancel.json',
                    'token=' + encodeURIComponent(token),
                    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
                ).then(
                    () => log('Ack success:', receipt),
                    err => {
                        log.error('Ack failure:', err);
                        throw err; // keep the Promise rejected
                    }
                );
            }));
        }
        
    };
    
}
