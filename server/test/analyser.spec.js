import * as testUtils from './test-utils';
import * as analyser from '../app/analyser';
import _ from 'lodash';

describe('analyser', () => {

    const { assertEqual } = testUtils;

    const TIMESTAMP_BASE = 1459000000000; // Sat Mar 26 2016 15:46:40 GMT+0200 (EET), arbitrary but nicely aligned
    const TIMESTAMP_TICK = 1000 * 60 * 5; // 5 min == 300000 ms

    function assertTimelineAnalysis(...expectedTimeline) {
        const actualTimeline = expectedTimeline.map((timelineEntry, i) => {
            const currentTimestamp = TIMESTAMP_BASE + i * TIMESTAMP_TICK;
            const analysisResult = analyser.analyseTimelineSnapshot({
                currentTimestamp,
                activeProfile: analyser.getActiveProfile(currentTimestamp),
                latestEntries: expectedTimeline
                    .slice(0, i + 1) // all entries thus far
                    .map(([ { nb_glucose_value, direction } ], j) => ({
                        date: TIMESTAMP_BASE + j * TIMESTAMP_TICK,
                        direction,
                        nb_glucose_value
                    })),
                latestTreatments: [],
                latestDeviceStatus: [],
                latestAlarms: []
            });
            const actualSituations = _.compact(_.map(analysisResult, (val, key) => val ? key : null)); // e.g. { high: true, low: false } => [ 'high' ]
            return timelineEntry.slice(0, 1).concat(actualSituations)
        });
        assertEqual(actualTimeline, expectedTimeline);
    }

    it('detects highs', () => {
        assertTimelineAnalysis(
            [ { nb_glucose_value:  8, direction: 'SingleUp'   } ],
            [ { nb_glucose_value: 10, direction: 'SingleUp'   } ],
            [ { nb_glucose_value: 16, direction: 'SingleUp'   }, analyser.STATUS_HIGH ],
            [ { nb_glucose_value: 16, direction: 'Flat'       }, analyser.STATUS_HIGH ],
            [ { nb_glucose_value: 11, direction: 'SingleDown' } ],
            [ { nb_glucose_value:  8, direction: 'SingleDown' } ],
        );
    });
    
});
