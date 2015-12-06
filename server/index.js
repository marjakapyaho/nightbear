import express from 'express';
import bodyParser from 'body-parser';
import * as api from './api';
import * as alarms from './alarms';

const STATIC_ASSETS_PATH = '/legacy-client-dist';
const app = express().use(bodyParser.json());

const server = app.listen(3000, function() {
    console.log('nightbear server listening on port %s', server.address().port);
    alarms.initAlarms();
});

app.post('/api/v1/entries', function(req, res) {
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
