import alarms from './alarms';
import analyser from './analyser';
import data from './data';
import server from './server';

const modules = {
    currentTime: null,
    pouchDB: null,
    pushover: null,
    alarms,
    analyser,
    data,
    server
};

export default function(overrides = {}) {
    const app = {};
    const inject = m => app[m] = (overrides[m] || modules[m](app));
    Object.keys(modules).forEach(inject);
    return app;
}
