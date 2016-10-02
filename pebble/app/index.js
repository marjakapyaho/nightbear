var BEAR_BASE_URL = 'http://nightbear.jrw.fi/api/v1';
var HTTP_TIMEOUT = 6000;

Pebble.addEventListener('ready', function() {
    fetchAlarms();
});

Pebble.addEventListener('appmessage', function(dict) {
    if (dict.payload.ACK_ALARM) {
        ackAlarm();
    }
});

function fetchAlarms() {
    var url = BEAR_BASE_URL + '/status';

    xhrWrapper(url, 'get',
        function(response) {
            sendResultToPebble(response);
        },
        function(errorStatus) {
            Pebble.sendAppMessage({ 'API_ERROR': 'Fetch failed'});
        }
    );
}

function ackAlarm() {
    var url = BEAR_BASE_URL + '/status';

    xhrWrapper(url, 'post',
        function() {
            Pebble.sendAppMessage({ 'ACK_SUCCESS': 'true'});
        },
        function() {
            Pebble.sendAppMessage({ 'API_ERROR': 'Ack failed'});
        }
    );
}

function sendResultToPebble(json) {
    var alarms = json.alarms;
    var currentAlarm;

    if (alarms.length > 0) {
        currentAlarm = alarms[0];
    }

    if (currentAlarm) {
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

function xhrWrapper(url, type, successCb, errorCb) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                successCb(xhr.response);
            }
            else {
                errorCb();
            }
        }
    };
    xhr.open(type, url);
    xhr.setRequestHeader('Accept', 'application/json');
    xhr.timeout = HTTP_TIMEOUT;
    xhr.responseType = 'json';
    xhr.send();
}
