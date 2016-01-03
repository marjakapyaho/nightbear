import * as api from './api';
import * as data from './data';
import * as server from './server';
import _ from 'lodash';

function bind(module, app) {
    return _.mapValues(module, function(method) {
        if (_.isFunction(method)) {
            return method.bind(null, app);
        } else {
            return method; // not a method
        }
    });
}

export default function(pouchDB) {
    const app = { pouchDB };
    app.data = bind(data, app);
    app.api = bind(api, app);
    app.server = bind(server, app);
    return app;
}
