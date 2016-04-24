import express from 'express';
import bodyParser from 'body-parser';
import { attempt, isError } from 'lodash';

export default app => {

    const log = app.logger(__filename);
    const parseIfPossible = body => {
        const parsed = attempt(JSON.parse, body);
        return isError(parsed) ? body : parsed;
    };

    return {
        createExpressServer(port = 0, staticAssetsPath = null) {

            const server = express().use(bodyParser.json());

            server.use(logResponseBody);

            server.post('/api/v1/entries', function(req, res) {
                app.data.nightscoutUploaderPost(req.body).then(
                    data => res.status(200).send(data || null),
                    err => res.status(500).send({ error: err && err.message || true })
                );
            });

            server.get('/api/v1/status', function(req, res) {
                app.data.getStatus().then(
                    data => res.status(200).send(data || null),
                    err => res.status(500).send({ error: err && err.message || true })
                );
            });

            server.post('/api/v1/status', function(req, res) {
                app.data.ackLatestAlarm(req.body).then(
                    data => res.status(200).send(data || null),
                    err => res.status(500).send({ error: err && err.message || true })
                );
            });

            // Rig battery status
            server.post('/api/v1/devicestatus', function(req, res) {
                app.data.createDeviceStatus(req.body).then(
                    data => res.status(200).send(data || null),
                    err => res.status(500).send({ error: err && err.message || true })
                );
            });

            // Save data for use in tests
            server.post('/api/v1/test-data', function(req, res) {
                app.data.saveTestData(req.body.name).then(
                    data => res.status(200).send(data || null),
                    err => res.status(500).send({ error: err && err.message || true })
                );
            });

            // LEGACY URLS

            server.get('/api/entries', function(req, res) {
                app.data.getLegacyEntries(req.query.hours ? parseFloat(req.query.hours) : undefined).then(
                    data => res.status(200).send(data || null),
                    err => res.status(500).send({ error: err && err.message || true })
                );
            });

            server.post('/api/entries', function(req, res) {
                app.data.legacyPost(req.body).then(
                    data => res.status(200).send(data || null),
                    err => res.status(500).send({ error: err && err.message || true })
                );
            });

            if (staticAssetsPath) {
                log('Serving static assets from: ' + staticAssetsPath);
                server.use('/', express.static(staticAssetsPath));
            }

            return new Promise(function(resolve) {
                const binding = server.listen(port, function() {
                    const port = binding.address().port;
                    log('Listening on port:', port);
                    resolve(port);
                });
            });

        }
    };

    // @see http://stackoverflow.com/a/19215370
    function logResponseBody(req, res, next) {
        const then = Date.now();
        const oldWrite = res.write, oldEnd = res.end;
        const chunks = [];
        res.write = function(chunk) {
            chunks.push(chunk);
            oldWrite.apply(res, arguments);
        };
        res.end = function(chunk) {
            if (chunk) chunks.push(new Buffer(chunk));
            var body = Buffer.concat(chunks).toString('utf8');
            log.debug(req.method + ' ' + req.path, {
                incoming: parseIfPossible(req.body),
                outgoing: parseIfPossible(body),
                duration: ((Date.now() - then) / 1000).toFixed(3) + ' sec'
            });
            oldEnd.apply(res, arguments);
        };
        next();
    }

}
