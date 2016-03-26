import * as testUtils from './test-utils';
import * as analyser from '../app/analyser';
import _ from 'lodash';

describe('analyser', () => {

    const { assertEqual } = testUtils;

    const NIGHTTIME = 1458960000000; // Sat Mar 26 2016 04:40:00 GMT+0200 (EET), arbitrary but nicely aligned
    const DAYTIME = 1459000000000; // Sat Mar 26 2016 15:46:40 GMT+0200 (EET), ^ ditto
    const TIMELINE_TICK = 1000 * 60 * 5; // 5 min == 300000 ms

    const situationObjectToArray = x => _.compact(_.map(x, (val, key) => val ? key : null)); // e.g. { high: true, low: false } => [ 'high' ]

    function assertTimelineAnalysis(startTimestamp, ...expectedTimeline) {
        const actualTimeline = expectedTimeline.map((timelineEntry, i) => {
            const currentTimestamp = startTimestamp + i * TIMELINE_TICK;
            const snapshot = {
                currentTimestamp,
                activeProfile: analyser.getActiveProfile(currentTimestamp),
                latestEntries: expectedTimeline
                    .slice(0, i + 1) // all entries thus far
                    .map(([ { nb_glucose_value, direction } ], j) => ({
                        date: startTimestamp + j * TIMELINE_TICK,
                        direction,
                        nb_glucose_value
                    })),
                latestTreatments: [],
                latestDeviceStatus: [],
                latestAlarms: []
            };
            const actualSituations = situationObjectToArray(analyser.analyseTimelineSnapshot(snapshot));
            return timelineEntry.slice(0, 1).concat(actualSituations)
        });
        assertEqual(actualTimeline, expectedTimeline);
    }

    it('detects outdated data', () => {
        assertEqual(
            situationObjectToArray(
                analyser.analyseTimelineSnapshot({
                    currentTimestamp: DAYTIME,
                    activeProfile: analyser.getActiveProfile(DAYTIME),
                    latestEntries: [],
                    latestTreatments: [],
                    latestDeviceStatus: [],
                    latestAlarms: []
                })
            ),
            [ analyser.STATUS_OUTDATED ]
        );
    });

    it('detects highs', () => {
        assertTimelineAnalysis(
            DAYTIME,
            [ { nb_glucose_value:  8, direction: 'SingleUp'   } ],
            [ { nb_glucose_value: 10, direction: 'SingleUp'   } ],
            [ { nb_glucose_value: 16, direction: 'SingleUp'   }, analyser.STATUS_HIGH ],
            [ { nb_glucose_value: 16, direction: 'Flat'       }, analyser.STATUS_HIGH ],
            [ { nb_glucose_value: 11, direction: 'SingleDown' } ],
            [ { nb_glucose_value:  8, direction: 'SingleDown' } ],
        );
    });

});
