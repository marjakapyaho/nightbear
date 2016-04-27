import ENTRIES from './sensor-change.json';
import * as testUtils from './test-utils';

describe('entries input and output', () => {

    const { assertEqual, serially } = testUtils;
    let app, get, post;

    beforeEach(function() {
        return app = testUtils.createTestApp().then(newApp => {
            app = newApp;
            app.__test.setCurrentTime(1451472024000 + 1000); // 1 sec after the last entry in ENTRIES
            get = app.__test.get;
            post = app.__test.post;
            return app.__test.createTestServer();
        });
    });

    it('interprets sensor change correctly', () => {
        return serially(ENTRIES.map(data => () => post('/api/v1/entries', data)))
            .then(() => get('/api/entries'))
            .then(entries => assertEqual(
                entries,
                [
                    { time: 1451470224000, sugar: '7.6', is_raw: false },
                    { time: 1451470524000, sugar: '7.7', is_raw: false },
                    { time: 1451470824000, sugar: '7.9', is_raw: false },
                    { time: 1451471424000, sugar: '8.4', is_raw: true },
                    { time: 1451471724000, sugar: '8.6', is_raw: true },
                    { time: 1451472024000, sugar: '8.9', is_raw: true }
                ]
            ));
    });

});
