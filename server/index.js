import express from 'express';
import bodyParser from 'body-parser';
import * as api from './api';
import * as analyser from './analyser';

const app = express().use(bodyParser.json());

app.post('/api/v1/entries', function(req, res) {
    api.nightscoutUploaderPost(req.body).then(
        data => res.status(200).send(data || null),
        err => res.status(500).send({ error: err && err.message || true })
    );
});

// LEGACY URL
app.get('/api/entries', function(req, res) {
    api.getLegacyEntries().then(
        data => res.status(200).send(data || null),
        err => res.status(500).send({ error: err && err.message || true })
    );
});

const server = app.listen(3000, function() {
    console.log('result of hc analysis:');
    console.log(analyser.analyseData(getTestData(), getTestCal()));
    console.log('nightbear server listening on port %s', server.address().port);
});

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
