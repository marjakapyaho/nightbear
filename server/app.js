import * as data from './data';
import * as server from './server';
import * as alarms from './alarms';
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

export default function(pouchDB, currentTime) {
    const app = {
        pouchDB,
        currentTime // currentTime() == Date.now()
    };
    app.data = bind(data, app);
    app.server = bind(server, app);
    app.alarms = bind(alarms, app);
    return app;
}
