// This file contains some PoC code for producing more interesting stats out of Cloudant

// Setup
var PouchDB = require('../server/node_modules/pouchdb');
var db = new PouchDB(process.env.DB_URL);
var out = x => console.log(x);

// Ensure the design docs exist
db.get('_design/nightbear_immutability')
    .catch(() => ({ _id: '_design/nightbear_immutability' }))
    .then(doc => {
        // https://docs.cloudant.com/design_documents.html#update-validators
        doc.validate_doc_update = function(newDoc, oldDoc) {
            if (!oldDoc) return; // creating new docs isn't mutation -> it's always fine
            if (!newDoc._id.match(/^(alarms|treatments)\//)) {
                throw({ forbidden: 'By default, all nightbear doc types are immutable; "' + newDoc._id + '" isn\'t exempt.' });
            }
        }.toString();
        doc.views = {
            mutable_timeline: {
                map: function(doc) {
                    var match = doc._id.match(/^(?:alarms|treatments)\/(.+)/);
                    if (match) emit(match[1]); // e.g. "2016-01-04T12:09:40Z"
                }.toString()
            },
            immutable_timeline: {
                map: function(doc) {
                    var match = doc._id.match(/^(?!alarms|treatments).+?\/(.+)/);
                    if (match) emit(match[1]); // e.g. "2016-01-04T12:09:40Z"
                }.toString()
            }
        };
        return db.put(doc);
    })
    .then(out, out);
