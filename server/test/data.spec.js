import ENTRIES from './sensor-change.json';
import * as testUtils from './test-utils';
import * as analyser from '../app/analyser';
import * as helpers from '../app/helpers';

const NOW = 1451846139373; // arbitrary but known

describe('data', () => {

    const { assertEqual, stripMetaFields } = testUtils;
    let app, get, post, setCurrentTime;
    const testCal1 = {
        "device": "dexcom",
        "scale": 1,
        "dateString": "Sat Jan 14 20:15:57 EET 2017",
        "date": 1484417757000,
        "type": "cal",
        "intercept": 30000,
        "slope": 890.5885872888931
    };
    const uploaderEntry = {
        "unfiltered": 196800,
        "filtered": 201728,
        "direction": "Flat",
        "device": "dexcom",
        "rssi": 173,
        "sgv": 135,
        "dateString": "Sun Jan 15 13:05:56 EET 2017",
        "type": "sgv",
        "date": 1484478356000,
        "noise": 1
    };
    const testCal2 = {
        "device": "dexcom",
        "scale": 0.9759277764179161,
        "dateString": "Sun Jan 08 10:26:06 EET 2017",
        "date": 1483863966000,
        "type": "cal",
        "intercept": 30000,
        "slope": 670.2983835165696
    };
    const uploaderEntry1 = {
        "unfiltered": 100000,
        "filtered": 174752,
        "direction": "FortyFiveDown",
        "device": "dexcom",
        "rssi": 200,
        "sgv": 200,
        "dateString": "Sun Jan 03 2016 19:55:39 GMT+0200",
        "type": "sgv",
        "date": NOW - (helpers.MIN_IN_MS * 40),
        "noise": 2
    };
    const uploaderEntry2 = {
        "unfiltered": 200000,
        "filtered": 174752,
        "direction": "FortyFiveDown",
        "device": "dexcom",
        "rssi": 300,
        "sgv": 300,
        "dateString": "Sun Jan 03 2016 20:05:39 GMT+0200 ",
        "type": "sgv",
        "date": NOW - (helpers.MIN_IN_MS * 30),
        "noise": 2
    };
    const uploaderEntry3 = {
        "unfiltered": 400000,
        "filtered": 174752,
        "direction": "FortyFiveDown",
        "device": "dexcom",
        "rssi": 300,
        "sgv": 300,
        "dateString": "Sun Jan 03 2016 20:33:39 GMT+0200",
        "type": "sgv",
        "date": NOW - (helpers.MIN_IN_MS * 5),
        "noise": 2
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

    it('receives uploader entry and creates correct data entry', () => {
        setCurrentTime(NOW);
        return post('/api/v1/entries', testCal1)
            .then(() => post('/api/v1/entries', uploaderEntry))
            .then(() => app.pouchDB.allDocs({
                include_docs: true,
                limit: 1,
                startkey: 'sensor-entries-raw/'
            }))
            .then(res => res.rows[0].doc)
            .then(entry => assertEqual(stripMetaFields(entry), {
                "unfiltered": 196800,
                "filtered": 201728,
                "direction": "Flat",
                "device": "dexcom",
                "rssi": 173,
                "sgv": 135,
                "dateString": "Sun Jan 15 13:05:56 EET 2017",
                "type": "sgv",
                "date": 1484478356000,
                "noise": 1,
                "nb_raw_value": 7.3,
                "nb_glucose_value": 7.5
            }));
    });

    it('receives parakeet entry and creates correct data entries', () => {
        setCurrentTime(NOW);
        return post('/api/v1/entries', testCal1)
            .then(() => get('/api/v1/entries?rr=469575&zi=6783252&pc=23456&lv=196800&lf=201728&db=217&ts=365336&bp=82&bm=4058&ct=300&gl=60.183220,24.923210'))
            .then(() => app.pouchDB.allDocs({
                include_docs: true,
                limit: 1,
                startkey: 'sensor-entries-raw/'
            }))
            .then(res => res.rows[0].doc)
            .then(entry => assertEqual(stripMetaFields(entry), {
                "unfiltered": 196800,
                "filtered": 201728,
                "device": "parakeet",
                "type": "raw",
                "date": 1451845774037,
                "nb_glucose_value": 7.3
            }));
    });

    it('returns uploader entries and parakeet entries in correct order', () => {
        setCurrentTime(NOW);
        return post('/api/v1/entries', testCal2)
            .then(() => post('/api/v1/entries', uploaderEntry3))
            .then(() => post('/api/v1/entries', uploaderEntry1))
            .then(() => get('/api/v1/entries?rr=469575&zi=6783252&pc=23456&lv=300000&lf=151872&db=217&ts=1200000&bp=82&bm=4058&ct=300&gl=60.183220,24.923210'))
            .then(() => get('/api/v1/entries?rr=469575&zi=6783252&pc=23456&lv=500000&lf=151872&db=217&ts=360000&bp=82&bm=4058&ct=300&gl=60.183220,24.923210'))
            .then(() => get('/api/v1/entries?rr=469575&zi=6783252&pc=23456&lv=500000&lf=151872&db=217&ts=60000&bp=82&bm=4058&ct=300&gl=60.183220,24.923210'))
            .then(() => post('/api/v1/entries', uploaderEntry2))
            .then(() => app.data.getLatestEntries(2 * helpers.HOUR_IN_MS))
            .then((entries) => {
                assertEqual(entries.length, 4);

                assertEqual(entries[0].device, 'dexcom');
                assertEqual(entries[1].device, 'dexcom');
                assertEqual(entries[2].device, 'parakeet');
                assertEqual(entries[3].device, 'dexcom');

                assertEqual(entries[0].unfiltered, 100000);
                assertEqual(entries[1].unfiltered, 200000);
                assertEqual(entries[2].unfiltered, 300000);
                assertEqual(entries[3].unfiltered, 400000);
            })
    });

    it('returns correct HBA1C for given values', () => {
        setCurrentTime(NOW);
        return post('/api/v1/entries', testCal2)
            .then(() => post('/api/v1/entries', uploaderEntry3))
            .then(() => post('/api/v1/entries', uploaderEntry1))
            .then(() => get('/api/v1/entries?rr=469575&zi=6783252&pc=23456&lv=196800&lf=151872&db=217&ts=1200000&bp=82&bm=4058&ct=300&gl=60.183220,24.923210'))
            .then(() => get('/api/v1/entries?rr=469575&zi=6783252&pc=23456&lv=196800&lf=151872&db=217&ts=360000&bp=82&bm=4058&ct=300&gl=60.183220,24.923210'))
            .then(() => get('/api/v1/entries?rr=469575&zi=6783252&pc=23456&lv=196800&lf=151872&db=217&ts=60000&bp=82&bm=4058&ct=300&gl=60.183220,24.923210'))
            .then(() => post('/api/v1/entries', uploaderEntry2))
            .then(() => app.data.getHba1c(1))
            .then(hba1c => assertEqual(hba1c, '10.0'));
    });
});
