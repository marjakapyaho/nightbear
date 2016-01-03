import ENTRIES from './sensor-change.json';
import * as testUtils from './test-utils';
import * as analyser from '../analyser';

xdescribe('data', () => {

    const { assertEqual, stripMetaFields } = testUtils;
    let app;

    beforeEach(function() {
        app = testUtils.createTestApp();
    });

    it('creates and returns an alarm object', () => {
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
            ]));
    });

});
