import ENTRIES from './sensor-change.json';
import * as testUtils from './test-utils';
import * as analyser from '../analyser';

const NOW = 1451846139373; // arbitrary but known

describe('data', () => {

    const { assertEqual, stripMetaFields } = testUtils;
    let app, setCurrentTime;

    beforeEach(function() {
        app = testUtils.createTestApp();
        setCurrentTime = app.__test.setCurrentTime;
    });

    it('creates and returns an alarm object', () => {
        setCurrentTime(NOW);
        return app.data.createAlarm(analyser.STATUS_HIGH, 1)
            .then(() => app.data.getActiveAlarms())
            .then(stripMetaFields)
            .then(alarms => assertEqual(alarms, [
                {
                    ack: false,
                    level: 1,
                    status: 'active',
                    type: 'high'
                }
            ]))
            .then(() => app.data.ackLatestAlarm())
            .then(() => app.data.getActiveAlarms(true)) // includeAcks = true
            .then(stripMetaFields)
            .then(alarms => assertEqual(alarms, [
                {
                    ack: NOW, // has been acknowledged
                    level: 1,
                    status: 'active',
                    type: 'high'
                }
            ]))
            .then(() => app.data.getActiveAlarms(false)) // includeAcks = false
            .then(alarms => assertEqual(alarms, []));
    });

});
