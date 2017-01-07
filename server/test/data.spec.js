import ENTRIES from './sensor-change.json';
import * as testUtils from './test-utils';
import * as analyser from '../app/analyser';
import * as helpers from '../app/helpers';

const NOW = 1451846139373; // arbitrary but known

describe('data', () => {

    const { assertEqual, stripMetaFields } = testUtils;
    let app, get, post, setCurrentTime;
    const testCal = {
        "device": "dexcom",
        "scale": 1,
        "dateString": "Sun Jan 03 12:10:08 EET 2016",
        "date": NOW,
        "type": "cal",
        "intercept": 30000,
        "slope": 788.8442542907525
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
            .then(() => get('/api/v1/entries?rr=469575&zi=6783252&pc=13337&lv=173344&lf=199488&db=217&ts=365336&bp=82&bm=4058&ct=300&gl=60.183220,24.923210'))
            .then(() => app.pouchDB.allDocs({
                include_docs: true,
                limit: 1,
                startkey: 'sensor-entries-raw/'
            }))
            .then(res => res.rows[0].doc)
            .then(entry => assertEqual(stripMetaFields(entry), {
                "unfiltered": 173344,
                "filtered": 199488,
                "device": "parakeet",
                "nb_glucose_value": helpers.setActualGlucoseForParakeet(entry, testCal),
                "type": "raw",
                "date": helpers.convertCurrentTimeForParakeet(app, "365336")
            }));
    });
});
