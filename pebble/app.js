var UI = require('ui');
var Vector2 = require('vector2');
var ajax = require('ajax');
var Vibe = require('ui/vibe');
var Accel = require('ui/accel');

var BEAR_URL = 'http://nightbear.jrw.fi/api/entries?hours=3';
var BEAR_BASE_URL = 'http://nightbear.jrw.fi/api/v1';
var HALF_WINDOW_HEIGHT = 84;
var TEXT_POSITION = 20;
var X_START = 0;
var X_WIDTH = 144;
var Y_START = 160;
var PIXELS_PER_MS = X_WIDTH / (3 * 60 * 60 * 1000); // 3 hours
var PIXELS_PER_MMOL = 4;

var alarmCleared = false;
var alarmOn = false;

var bearWindow = new UI.Window({
    fullscreen: true
});

var rect = new UI.Rect({
    position: new Vector2(0, 0),
    size: new Vector2(144, 168),
    backgroundColor:'black'
});

var upperRect = new UI.Rect({
    position: new Vector2(0, 0),
    size: new Vector2(144, HALF_WINDOW_HEIGHT),
    backgroundColor:'islamicGreen'
});

var text = new UI.Text({
    position: new Vector2(0, TEXT_POSITION),
    size: new Vector2(144, 42),
    text: '-',
    font:'BITHAM_42_BOLD',
    color:'white',
    textOverflow:'fill',
    textAlign:'center'
});

var clock = new UI.Text({
    position: new Vector2(0, 0),
    size: new Vector2(144, 14),
    text: '--:--',
    font: 'GOTHIC_14',
    color:'white',
    textOverflow:'fill',
    textAlign:'center'
});

// In 3 hours there's about 36 5 hour intervals (+ some extra)
var circles = range(45).map(function() {
    return new UI.Circle({
        position: new Vector2(0, -5),
        radius: 1,
        backgroundColor: 'white',
    });
});

var largerCircles = range(30).map(function() {
    return new UI.Circle({
        position: new Vector2(0, -5),
        radius: 4,
        backgroundColor: 'white',
    });
});

// Init app
initApp();

function initApp() {

    // Prepare the accelerometer
    Accel.init();

    // Display the text in the window
    bearWindow.add(rect);
    bearWindow.add(upperRect);
    bearWindow.add(text);
    bearWindow.add(clock);
    circles.forEach(addToWindow);
    largerCircles.forEach(addToWindow);

    // Show the actual window
    bearWindow.show();

    // Start the clock
    startClock();

    // InitAlarms
    initAlarms();

    // Init data fetch
    fetchNewData();
    setInterval(fetchNewData, 60000); // 1 min

    // Init status check
    //checkAlarmStatus();
    //setInterval(checkAlarmStatus, 300000); // 5 min
}


/** Helpers **/

function initAlarms() {
    var shakeLatest = 0;
    var shakePrevious = 0;

    bearWindow.on('accelTap', function(e) {
        shakePrevious = shakeLatest;
        shakeLatest = Date.now();

        if (shakeLatest - shakePrevious < 10000) { // 30 sec
            clearAlarm();
        }

    });

    function clearAlarm() {
        if (!alarmOn || alarmCleared) { return; }

        alarmCleared = true;

        // Send alarm cleared ajax call
        clearAlarmOnServer();

        setTimeout(function() {
            alarmCleared = false;
        }, 3600000); // 60 min

        Pebble.showSimpleNotificationOnPebble('Alarm cleared', '');
    }
}

function checkAlarmStatus() {
    ajax({ url: BEAR_BASE_URL + '/status', type: 'json', headers: { 'accept': 'application/json' } },
        function(alarms) {
            console.log('Server has', alarms.length, ' alarms');

            var validAlarms = 0;
            alarms.forEach(function(alarm) {
                if (!alarm.ack) {
                    validAlarms++;
                }
            });

            if (validAlarms > 0) {
                Vibe.vibrate('double');
                alarmOn = true;
            }
            else {
                alarmOn = false;
            }
        },
        function(err) {
            console.log('Error', err);
        }
    );
}

function clearAlarmOnServer() {
    ajax({ url: BEAR_BASE_URL + '/status', method: 'post', type: 'json', headers: { 'accept': 'application/json' } },
        function(data) {
            console.log('Successfully cleared alarm from server');
        },
        function(err) {
            console.log('Error', err);
        }
    );
}

function range(num) {
    return new Array(num + 1)
        .join(' ')
        .split('')
        .map(function(value, key) { return key; });
}

function addToWindow(el) {
    bearWindow.add(el);
}

function drawGraph(data) {
    data.reverse();

    // Clear larger circles
    largerCircles.forEach(function(circle) {
        circle.position(new Vector2(0, -100));
    });

    // Clear small circles
    circles.forEach(function(circle) {
        circle.position(new Vector2(0, -100));
    });

    var largeCircleIndex = 0;
    var latestSugar = 10;
    data.forEach(function(datum, index) {
        var sugar = datum.sugar ? parseFloat(datum.sugar) : latestSugar;
        latestSugar = sugar;

        var timeSinceNowInMs = Date.now() - datum.time;

        var x = Math.round(X_START + X_WIDTH - timeSinceNowInMs * PIXELS_PER_MS);
        var y = Math.round(Y_START - parseFloat(sugar) * PIXELS_PER_MMOL);

        var circlePosition = new Vector2(x >= X_START ? x : -100, y ? y : -100);
        var circleColor = evaluateColor(sugar, datum.is_raw);

        if (circles[index]) {
            circles[index].position(circlePosition);
            circles[index].backgroundColor(circleColor);

            if (datum.insulin) {
                largerCircles[largeCircleIndex].position(circlePosition);
                largerCircles[largeCircleIndex].backgroundColor('red');
                largeCircleIndex++;
            }
            else if (datum.carbs) {
                largerCircles[largeCircleIndex].position(circlePosition);
                largerCircles[largeCircleIndex].backgroundColor('chromeYellow');
                largeCircleIndex++;
            }
        }
    });
}

function fetchNewData() {
    console.log('Fetching new data');

    ajax(
        {
            url: BEAR_URL,
            type: 'json',
            headers: {
                'accept': 'application/json'
            }
        },
        function(data) {
            console.log('Successfully fetched bear data!');

            var sugarValue = ':(';
            var circleColor = 'darkGray';

            var oneMinuteInMillis = 60*1000;
            var lastDataPoint = data[data.length - 1];

            var dataAge = (Date.now() - lastDataPoint.time) / oneMinuteInMillis;

            // If data is fresh
            if (dataAge < 11) {
                if (lastDataPoint.sugar) {
                    sugarValue = lastDataPoint.sugar;
                    circleColor = evaluateColor(parseInt(sugarValue, 10));

                    upperRect.backgroundColor(circleColor);

                    if (shouldAlarm(lastDataPoint.sugar)) {
                        Vibe.vibrate('double');
                    }
                }
            }
            else { // If data is outdated
                sugarValue = '-';
                alarmOn = true;
                if (!alarmCleared) {
                    Vibe.vibrate('double');
                }
            }

            text.text(sugarValue);

            drawGraph(data);

        },
        function(error) {
            console.log('Failed fetching bear data: ' + error);
            text.text('-');
            alarmOn = true;
            if (!alarmCleared) {
                Vibe.vibrate('double');
            }
        }
    );
}

// Used until server does this
function shouldAlarm(value) {
    var sugar = parseInt(value, 10);
    var timeHours = new Date().getHours();
    var mode = timeHours < 9 ? 'night' : 'day';
    var upperLimit, lowerLimit;

    if (mode === 'day') {
        upperLimit = 14;
        lowerLimit = 5.5;
    }
    else {
        upperLimit = 17;
        lowerLimit = 4.0;
    }

    if (sugar < lowerLimit || sugar > upperLimit) {
        alarmOn = true;
        if (!alarmCleared) {
            console.log('send out alarm');
            return true;
        }
    }
    else {
        alarmOn = false;
    }

    console.log('no alarm given');
    return false;
}

function startClock() {
    var lastMinutes;
    setInterval(function() {
        var hours = new Date().getHours();
        var minutes = new Date().getMinutes();
        minutes = minutes < 10 ? '0' + minutes : minutes;
        if (lastMinutes !== minutes) {
            clock.text(hours + ':' + minutes);
            lastMinutes = minutes;
        }
    }, 20000);
}

function evaluateColor(sugar, isRaw) {
    var color = 'white';

    if (isRaw) {
        color = 'white';
    }
    else if (sugar < 5) {
        color = 'darkCandyAppleRed';
    }
    else if (sugar > 10) {
        color = 'orange';
    }
    else {
        color = 'islamicGreen';
    }

    return color;
}
