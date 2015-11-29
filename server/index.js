import express from 'express';
import bodyParser from 'body-parser';
import * as api from './api';

const app = express().use(bodyParser.json());

app.post('/api/v1/entries', function(req, res) {
    api.nightscoutUploaderPost(req.body).then(
        data => res.status(200).send(data || null),
        err => res.status(500).send({ error: err && err.message || true })
    );
});

const server = app.listen(3000, function() {
    console.log('nightbear server listening on port %s', server.address().port);
});
