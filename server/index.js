import express from 'express';
import bodyParser from 'body-parser';
import * as api from './api';
import * as analyser from './analyser';
import * as alarms from './alarms';

const STATIC_ASSETS_PATH = '/legacy-client-dist';

const app = express().use(bodyParser.json());
const MIN_IN_MILLIS = 60 * 1000;

export function runChecks() {
    alarms.sendAlarm(analyser.analyseData(getProfile(), getTestData(), getTestCal()));
}

app.post('/api/v1/entries', function(req, res) {
    runChecks();
    api.nightscoutUploaderPost(req.body).then(
        data => res.status(200).send(data || null),
        err => res.status(500).send({ error: err && err.message || true })
    );
});

app.get('/api/v1/status', function(req, res) {
    api.getStatus().then(
        data => res.status(200).send(data || null),
        err => res.status(500).send({ error: err && err.message || true })
    );
});

app.post('/api/v1/status', function(req, res) {
    api.setStatus(req.body).then(
        data => res.status(200).send(data || null),
        err => res.status(500).send({ error: err && err.message || true })
    );
});

// LEGACY URLS
app.get('/api/entries', function(req, res) {
    api.getLegacyEntries().then(
        data => res.status(200).send(data || null),
        err => res.status(500).send({ error: err && err.message || true })
    );
});

app.post('/api/entries', function(req, res) {
    api.legacyPost(req.body).then(
        data => res.status(200).send(data || null),
        err => res.status(500).send({ error: err && err.message || true })
    );
});

if (process.env.NODE_ENV === 'production') {
    console.log('Serving static assets from: ' + STATIC_ASSETS_PATH);
    app.use('/', express.static(STATIC_ASSETS_PATH));
}

const server = app.listen(3000, function() {
    console.log('nightbear server listening on port %s', server.address().port);
    setInterval(runChecks, 5 * MIN_IN_MILLIS);
});

function getProfile() {

    if (new Date().getHours() > 9) { // DAY
        return {
            HIGH_LEVEL_REL: 10,
            HIGH_LEVEL_ABS: 16,
            LOW_LEVEL_REL: 7,
            LOW_LEVEL_ABS: 4,
            TIME_SINCE_SGV_LIMIT: 20 * MIN_IN_MILLIS
        };
    }
    else { // NIGHT
        return {
            HIGH_LEVEL_REL: 13,
            HIGH_LEVEL_ABS: 16,
            LOW_LEVEL_REL: 6,
            LOW_LEVEL_ABS: 4,
            TIME_SINCE_SGV_LIMIT: 30 * MIN_IN_MILLIS
        };
    }
}

function getTestData() {
    return [
        {
            "unfiltered": 158880,
            "filtered": 156608,
            "direction": "Flat",
            "device": "dexcom",
            "rssi": 168,
            "sgv": 300,
            "dateString": "Sun Nov 22 23:27:50 EET 2015",
            "type": "sgv",
            "date": Date.now(),
            "noise": 1
        }
    ];
}

function getTestCal() {
    return {
        "device": "dexcom",
        "scale": 1,
        "dateString": "Sat Nov 28 13:42:28 EET 2015",
        "date": Date.now(),
        "type": "cal",
        "intercept": 30923.080292889048,
        "slope": 846.2368050082694
    };
}
