// This file contains some PoC code for producing more interesting stats out of Cloudant

// Setup
var PouchDB = require('../server/node_modules/pouchdb');
var db = new PouchDB(process.env.DB_URL);
var out = x => console.log(x);

// Ensure the views exist
db.get('_design/global_stats')
    .catch(() => ({ _id: '_design/global_stats' }))
    .then(doc => {
        doc.views = {
            per_type: {
                map: function (doc) {
                    var match = doc._id.match(/(.+?)\/(.+?)T/);
                    if (match) emit([ match[1] ]); // e.g. [ "calibrations" ]
                }.toString(),
                reduce: '_count'
            },
            per_date_and_type: {
                map: function (doc) {
                    var match = doc._id.match(/(.+?)\/(.+?)T/);
                    if (match) emit([ match[2], match[1] ]); // e.g. [ "2015-11-29", "calibrations" ]
                }.toString(),
                reduce: '_count'
            }
        };
        return db.put(doc);
    })
    .then(out, out);

// How many docs per type
db.query('global_stats/per_type', { group: true })
    .then(res => res.rows.map(r => r.key.concat(r.value)))
    .then(out, out);

// How many docs per day and type
db.query('global_stats/per_date_and_type', { group: true })
    .then(res => res.rows.map(r => r.key.concat(r.value)))
    .then(out, out);

// How many docs per day
db.query('global_stats/per_date_and_type', { group: true, group_level: 1 })
    .then(res => res.rows.map(r => r.key.concat(r.value)))
    .then(out, out);
