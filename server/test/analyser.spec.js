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
            const entriesThusFar = expectedTimeline.slice(0, i + 1);
            const snapshot = {
                currentTimestamp,
                activeProfile: analyser.getActiveProfile(currentTimestamp),
                latestEntries: (
                    entriesThusFar
                        .map(([ { glucose, direction } ], j) => ({
                            date: startTimestamp + j * TIMELINE_TICK,
                            direction,
                            nb_glucose_value: glucose
                        }))
                ),
                latestTreatments: (
                    _.compact(
                        entriesThusFar
                            .map(([ { insulin, carbs } ], j) => {
                                const treatment = { date: startTimestamp + j * TIMELINE_TICK };
                                if (insulin) treatment.insulin = insulin;
                                if (carbs) treatment.carbs = carbs;
                                return (insulin || carbs) && treatment; // only create the treatment if it contains either field
                            })
                    )
                ),
                latestDeviceStatus: {
                    uploaderBattery: _.get(_.findLast(entriesThusFar, '[0].battery'), '[0].battery') || 100 // repeat the last battery specified in test case, or default to 100 if it's never specified
                },
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
                    latestDeviceStatus: {},
                    latestAlarms: []
                })
            ),
            [ analyser.STATUS_OUTDATED ]
        );
    });

    it('detects highs', () => {
        assertTimelineAnalysis(DAYTIME,
            [ { glucose:  8, direction: 'SingleUp'   } ],
            [ { glucose: 10, direction: 'SingleUp'   } ],
            [ { glucose: 16, direction: 'SingleUp'   }, analyser.STATUS_HIGH ],
            [ { glucose: 16, direction: 'Flat'       }, analyser.STATUS_HIGH ],
            [ { glucose: 11, direction: 'SingleDown' } ],
            [ { glucose:  8, direction: 'SingleDown' }, analyser.STATUS_FALLING ]
        );
    });

    it('detects low battery', () => {
        assertTimelineAnalysis(DAYTIME,
            [ { glucose:  8, direction: 'Flat' } ],
            [ { glucose:  8, direction: 'Flat', battery: 75 } ],
            [ { glucose:  8, direction: 'Flat', battery: 50 } ],
            [ { glucose:  8, direction: 'Flat', battery: 25 }, analyser.STATUS_BATTERY ],
            [ { glucose:  8, direction: 'Flat', battery:  5 }, analyser.STATUS_BATTERY ],
            [ { glucose:  8, direction: 'Flat', battery: 50 } ],
            [ { glucose:  8, direction: 'Flat', battery: 75 } ]
        );
    });

});
