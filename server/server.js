import express from 'express';
import bodyParser from 'body-parser';

export function createExpressServer({ api }, staticAssetsPath) {

    const server = express().use(bodyParser.json());

    server.post('/api/v1/entries', function(req, res) {
        api.nightscoutUploaderPost(req.body).then(
            data => res.status(200).send(data || null),
            err => res.status(500).send({ error: err && err.message || true })
        );
    });

    server.get('/api/v1/status', function(req, res) {
        api.getAlarms().then(
            data => res.status(200).send(data || null),
            err => res.status(500).send({ error: err && err.message || true })
        );
    });

    server.post('/api/v1/status', function(req, res) {
        api.ackAlarm(req.body).then(
            data => res.status(200).send(data || null),
            err => res.status(500).send({ error: err && err.message || true })
        );
    });

    // LEGACY URLS

    server.get('/api/entries', function(req, res) {
        api.getLegacyEntries(req.query.hours ? parseFloat(req.query.hours) : undefined).then(
            data => res.status(200).send(data || null),
            err => res.status(500).send({ error: err && err.message || true })
        );
    });

    server.post('/api/entries', function(req, res) {
        api.legacyPost(req.body).then(
            data => res.status(200).send(data || null),
            err => res.status(500).send({ error: err && err.message || true })
        );
    });

    if (staticAssetsPath) {
        console.log('Serving static assets from: ' + staticAssetsPath);
        server.use('/', express.static(staticAssetsPath));
    }

    return server;

}
