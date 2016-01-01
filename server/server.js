import express from 'express';
import bodyParser from 'body-parser';
import * as api from './api';

export default function createExpressServer(staticAssetsPath) {

    const app = express().use(bodyParser.json());

    app.post('/api/v1/entries', function(req, res) {
        api.nightscoutUploaderPost(req.body).then(
            data => res.status(200).send(data || null),
            err => res.status(500).send({ error: err && err.message || true })
        );
    });

    app.get('/api/v1/status', function(req, res) {
        api.getAlarms().then(
            data => res.status(200).send(data || null),
            err => res.status(500).send({ error: err && err.message || true })
        );
    });

    app.post('/api/v1/status', function(req, res) {
        api.ackAlarm(req.body).then(
            data => res.status(200).send(data || null),
            err => res.status(500).send({ error: err && err.message || true })
        );
    });

    // LEGACY URLS

    app.get('/api/entries', function(req, res) {
        api.getLegacyEntries(req.query.hours ? parseFloat(req.query.hours) : undefined).then(
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

    if (staticAssetsPath) {
        console.log('Serving static assets from: ' + staticAssetsPath);
        app.use('/', express.static(staticAssetsPath));
    }

    return app;

}
