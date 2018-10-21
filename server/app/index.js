import alarms from './alarms';
import analyser from './analyser';
import data from './data';
import server from './server';
import profile from './profile';

const modules = {
    logger: null,
    currentTime: null,
    pouchDB: null,
    pushover: null,
    nightscoutProxy: null,
    parakeetProxy: null,
    alarms,
    analyser,
    data,
    server,
    profile
};

export default function(overrides = {}) {
    const app = {};
    const inject = m => app[m] = (overrides[m] || modules[m] && modules[m](app));
    Object.keys(modules).forEach(inject);
    return app;
}