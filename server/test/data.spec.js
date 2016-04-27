import ENTRIES from './sensor-change.json';
import * as testUtils from './test-utils';
import * as analyser from '../app/analyser';

const NOW = 1451846139373; // arbitrary but known

describe('data', () => {

    const { assertEqual, stripMetaFields } = testUtils;
    let app, get, post, setCurrentTime;

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
});
