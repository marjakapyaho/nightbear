import axios from 'axios';
import { map } from 'lodash';

// @example new ParakeetProxy(new Logger(), 'https://parakeet-receiver-123.appspot.com/');
export default function(logger, parakeetProxyUrl) {

    const log = logger(__filename);

    return {

        sendEntry(incomingEntry) {
            const url = parakeetProxyUrl.replace(/\/*$/, '') + '/receiver.cgi?' + map(incomingEntry, (v,k) => k + '=' + v).join('&');
            log.debug('GET ' + url);
            return axios.get(url);
        },

    };

}
