import ENTRIES from './sensor-change.json';
import * as testUtils from './test-utils';
import * as analyser from '../app/analyser';

const NOW = 1451846139373; // arbitrary but known

describe('data', () => {

    const { assertEqual, stripMetaFields } = testUtils;
    let app, get, post, setCurrentTime;
    const testCal = {
        "device": "dexcom",
        "scale": 0.9759277764179161,
        "dateString": "Sun Jan 08 10:26:06 EET 2017",
        "date": 1483863966000,
        "type": "cal",
        "intercept": 30000,
        "slope": 670.2983835165696
    };

    beforeEach(function() {
        return testUtils.createTestApp().then(newApp => {
            app = newApp;
            setCurrentTime = app.__test.setCurrentTime;
            get = app.__test.get;
            post = app.__test.post;
            return app.__test.createTestServer();
        });
    });

    it('creates and returns an alarm object', () => {
        setCurrentTime(NOW);
        return app.data.createAlarm(analyser.STATUS_HIGH, 1)
            .then(() => app.data.getActiveAlarms())
            .then(stripMetaFields)
            .then(alarms => assertEqual(alarms, [
                {
                    level: 1,
                    status: 'active',
                    type: 'high',
                    validAfter: NOW
                }
            ]))
            .then(() => app.data.ackLatestAlarm())
            .then(() => app.data.getActiveAlarms(true)) // includeAcks = true
            .then(stripMetaFields)
            .then(alarms => assertEqual(alarms, [
                {
                    level: 1,
                    status: 'active',
                    type: 'high',
                    validAfter: NOW + 1000 * 60 * 90, // TODO: Get the snooze period from variable
                    pushoverReceipts: []
                }
            ]))
            .then(() => app.data.getActiveAlarms(false)) // includeAcks = false
            .then(alarms => assertEqual(alarms, []));
    });

    it('receives parakeet entry and creates correct data entries', () => {
        setCurrentTime(NOW);
        return post('/api/v1/entries', testCal)
            .then(() => get('/api/v1/entries?rr=469575&zi=6783252&pc=23456&lv=142720&lf=151872&db=217&ts=365336&bp=82&bm=4058&ct=300&gl=60.183220,24.923210'))
            .then(() => app.pouchDB.allDocs({
                include_docs: true,
                limit: 1,
                startkey: 'sensor-entries-raw/'
            }))
            .then(res => res.rows[0].doc)
            .then(entry => assertEqual(stripMetaFields(entry), {
                "unfiltered": 142720,
                "filtered": 151872,
                "device": "parakeet",
                "type": "raw",
                "date": 1451846139007,
                "nb_glucose_value": 9.1
            }));
    });
});
