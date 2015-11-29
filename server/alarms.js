import {
    STATUS_OUTDATED,
    STATUS_HIGH,
    STATUS_LOW,
    STATUS_RISING,
    STATUS_FALLING
} from './analyser';

export function sendAlarm(type) {

    if (type === STATUS_HIGH || type === STATUS_LOW) { // LEVEL 1
        console.log('Send out level 1 alarm (Pebble, Pushover');
    }
    else if (type === STATUS_OUTDATED || // LEVEL 2
             type === STATUS_RISING ||
             type === STATUS_FALLING) {
        console.log('Send out level 2 alarm (only Pebble)');
    }
}
