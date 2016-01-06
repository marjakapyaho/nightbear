import express from 'express';
import bodyParser from 'body-parser';

export function createExpressServer({ data }, port = 0, staticAssetsPath = null) {

    const server = express().use(bodyParser.json());

    server.post('/api/v1/entries', function(req, res) {
        data.nightscoutUploaderPost(req.body).then(
            data => res.status(200).send(data || null),
            err => res.status(500).send({ error: err && err.message || true })
        );
    });

    server.get('/api/v1/status', function(req, res) {
        data.getStatus().then(
            data => res.status(200).send(data || null),
            err => res.status(500).send({ error: err && err.message || true })
        );
    });

    server.post('/api/v1/status', function(req, res) {
        data.ackLatestAlarm(req.body).then(
            data => res.status(200).send(data || null),
            err => res.status(500).send({ error: err && err.message || true })
        );
    });

    // Rig battery status
    server.post('/api/v1/devicestatus', function(req, res) {
        data.createDeviceStatus(req.body).then(
            data => res.status(200).send(data || null),
            err => res.status(500).send({ error: err && err.message || true })
        );
    });

    // LEGACY URLS

    server.get('/api/entries', function(req, res) {
        data.getLegacyEntries(req.query.hours ? parseFloat(req.query.hours) : undefined).then(
            data => res.status(200).send(data || null),
            err => res.status(500).send({ error: err && err.message || true })
        );
    });

    server.post('/api/entries', function(req, res) {
        data.legacyPost(req.body).then(
            data => res.status(200).send(data || null),
            err => res.status(500).send({ error: err && err.message || true })
        );
    });

    if (staticAssetsPath) {
        console.log('Serving static assets from: ' + staticAssetsPath);
        server.use('/', express.static(staticAssetsPath));
    }

    return new Promise(function(resolve) {
        const binding = server.listen(port, function() {
            const port = binding.address().port;
            console.log('Listening on port %s', port);
            resolve(port);
        });
    });

}
