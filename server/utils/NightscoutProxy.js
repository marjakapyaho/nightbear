import axios from 'axios';
import { flatten } from 'lodash';

// @example new NightscoutProxy('http://nightscout.somehost.com');
// @example new NightscoutProxy([ 'http://nightscout1.somehost.com', 'http://nightscout2.somehost.com' ], 'SECRET');
export default function(nightscoutProxyUrl = '', nightscoutApiSecret = '') {

    const withoutTrailingSlash = x => x.replace(/\/*$/, '');
    const urls = flatten([ nightscoutProxyUrl ]).map(withoutTrailingSlash);
    const options = { headers: { 'api-secret': nightscoutApiSecret } };

    return {

        sendEntry(incomingEntry) {
            return Promise.all(urls.map(
                url => axios.post(url + '/api/v1/entries', incomingEntry, options))
            );
        },

        sendDeviceStatus(incomingDeviceStatus) {
            return Promise.all(urls.map(
                url => axios.post(url + '/api/v1/devicestatus', incomingDeviceStatus, options))
            );
        }

    };

}
