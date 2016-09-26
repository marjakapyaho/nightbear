var BEAR_BASE_URL = 'http://nightbear.jrw.fi/api/v1';

Pebble.addEventListener('ready', function() {
    fetchAlarms();
});

Pebble.addEventListener('appmessage', function(dict) {
    if(dict.payload['ACK_ALARM']) {
        ackAlarm();
    }
});

function fetchAlarms() {
    var url = BEAR_BASE_URL + '/status';

    xhrWrapper(url, 'get', {}, function(req) {
        if(req.status == 200) {
            sendResultToPebble(req.response);
        }
    });
}

function ackAlarm() {
    var url = BEAR_BASE_URL + '/status';

    xhrWrapper(url, 'post', {}, function(req) {
        if(req.status == 200) {
            Pebble.sendAppMessage({ 'ACK_SUCCESS': 'true'});
        }
    });
}

function sendResultToPebble(json) {
    var alarms = json.alarms;
    var currentAlarm;

    if (alarms.length > 0) {
        currentAlarm = alarms[0];
    }

    if(currentAlarm) {
        Pebble.sendAppMessage({
            'ALARM_FOUND': 'true',
            'ALARM_TYPE': currentAlarm.type,
            'ALARM_LEVEL': currentAlarm.level + ""
        });
    }
    else {
        Pebble.sendAppMessage({ 'ALARM_FOUND': 'false'});
    }
}

function xhrWrapper(url, type, data, callback) {
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
        callback(xhr);
    };
    xhr.open(type, url);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('accept', 'application/json');
    xhr.responseType='json';
    xhr.send();
}
