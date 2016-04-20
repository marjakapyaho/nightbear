import * as testUtils from './test-utils';
import * as analyser from '../app/analyser';
import * as helpers from '../app/helpers';
import _ from 'lodash';

const { assertEqual } = testUtils;
const DAYTIME = 1459000000000; // Sat Mar 26 2016 15:46:40 GMT+0200 (EET)
const TIMELINE_TICK = 1000 * 60 * 5; // 5 min == 300000 ms
const situationObjectToArray = x => _.compact(_.map(x, (val, key) => val ? key : null)); // e.g. { high: true, low: false } => [ 'high' ]
const PROFILE = {
    HIGH_LEVEL_REL: 10,
    HIGH_LEVEL_ABS: 15,
    LOW_LEVEL_REL: 9,
    LOW_LEVEL_ABS: 5,
    TIME_SINCE_SGV_LIMIT: 20 * helpers.MIN_IN_MS,
    BATTERY_LIMIT: 30,
    ALARM_RETRY: 120,
    ALARM_EXPIRE: 60 * 20 // 20 min
};

describe('analyser', () => {

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

    it('detects low', () => {
        assertTimelineAnalysis(DAYTIME,
            [ { glucose: 7, direction: 'FortyFiveDown' } ],
            [ { glucose: 6, direction: 'FortyFiveDown' } ],
            [ { glucose: 4.2, direction: 'FortyFiveDown' }, analyser.STATUS_LOW ],
            [ { glucose: 3.8, direction: 'Flat' }, analyser.STATUS_LOW ]
        );
    });

    it('needs to rise enough to clar low', () => {
        assertTimelineAnalysis(DAYTIME,
            [ { glucose: 6, direction: 'FortyFiveDown' } ],
            [ { glucose: 4.2, direction: 'FortyFiveDown' }, analyser.STATUS_LOW ],
            [ { glucose: 3.8, direction: 'Flat' }, analyser.STATUS_LOW ],
            [ { glucose: 5.5, direction: 'SingleUp', activeAlarm: analyser.STATUS_LOW }, analyser.STATUS_LOW ],
            [ { glucose: 7.1, direction: 'SingleUp' } ]
        );
    });

    it('detects high', () => {
        assertTimelineAnalysis(DAYTIME,
            [ { glucose: 8, direction: 'SingleUp' } ],
            [ { glucose: 10, direction: 'SingleUp' } ],
            [ { glucose: 16, direction: 'SingleUp' }, analyser.STATUS_HIGH ],
            [ { glucose: 16, direction: 'Flat' }, analyser.STATUS_HIGH ]
        );
    });

    it('needs to fall enough to clear high', () => {
        assertTimelineAnalysis(DAYTIME,
            [ { glucose: 10, direction: 'SingleUp' } ],
            [ { glucose: 16, direction: 'SingleUp' }, analyser.STATUS_HIGH ],
            [ { glucose: 14, direction: 'SingleDown', activeAlarm: analyser.STATUS_HIGH  }, analyser.STATUS_HIGH ],
            [ { glucose: 12.5, direction: 'SingleDown' } ]
        );
    });

    it('detects falling', () => {
        assertTimelineAnalysis(DAYTIME,
            [ { glucose: 9, direction: 'SingleDown' } ],
            [ { glucose: 7.7, direction: 'SingleDown' }, analyser.STATUS_FALLING ],
            [ { glucose: 6, direction: 'DoubleDown' }, analyser.STATUS_FALLING ],
            [ { glucose: 5.7, direction: 'FortyFiveDown' } ]
        );
    });

    it('detects rising', () => {
        assertTimelineAnalysis(DAYTIME,
            [ { glucose: 8, direction: 'SingleUp' } ],
            [ { glucose: 11, direction: 'SingleUp' }, analyser.STATUS_RISING ],
            [ { glucose: 13, direction: 'DoubleUp' }, analyser.STATUS_RISING ],
            [ { glucose: 14, direction: 'FortyFiveUp' } ]
        );
    });

    it('changes from falling to low', () => {
        assertTimelineAnalysis(DAYTIME,
            [ { glucose: 9, direction: 'DoubleDown' } ],
            [ { glucose: 6, direction: 'DoubleDown' }, analyser.STATUS_FALLING ],
            [ { glucose: 4.9, direction: 'DoubleDown' }, analyser.STATUS_LOW ]
        );
    });

    it('changes from rising to high', () => {
        assertTimelineAnalysis(DAYTIME,
            [ { glucose: 8, direction: 'SingleUp' } ],
            [ { glucose: 13, direction: 'DoubleUp' }, analyser.STATUS_RISING ],
            [ { glucose: 16, direction: 'DoubleUp' }, analyser.STATUS_HIGH ]
        );
    });

    it('does not alert too easily while noise level is high', () => {
        assertTimelineAnalysis(DAYTIME,
            [ { glucose: 9, direction: 'NOT COMPUTABLE', noise: 4 } ],
            [ { glucose: 9, direction: 'NOT COMPUTABLE', noise: 4 } ],
            [ { glucose: 9, direction: 'NOT COMPUTABLE', noise: 4 } ],
            [ { glucose: 9, direction: 'NOT COMPUTABLE', noise: 4 } ],
            [ { glucose: 9, direction: 'NOT COMPUTABLE', noise: 4 } ],
            [ { glucose: 8.5, direction: 'NOT COMPUTABLE', noise: 4 } ],
            [ { glucose: 7, direction: 'NOT COMPUTABLE', noise: 4 } ],
            [ { glucose: 5, direction: 'NOT COMPUTABLE', noise: 4 } ],
            [ { glucose: 9, direction: 'NOT COMPUTABLE', noise: 4 } ],
            [ { glucose: 5.2, direction: 'NOT COMPUTABLE', noise: 4 } ],
            [ { glucose: 8, direction: 'NOT COMPUTABLE', noise: 4 } ],
            [ { glucose: 10, direction: 'NOT COMPUTABLE', noise: 4 } ],
            [ { glucose: 7, direction: 'NOT COMPUTABLE', noise: 4 } ],
            [ { glucose: 9, direction: 'NOT COMPUTABLE', noise: 4 } ],
            [ { glucose: 11, direction: 'NOT COMPUTABLE', noise: 4 } ],
            [ { glucose: 13, direction: 'NOT COMPUTABLE', noise: 4 }, analyser.STATUS_RISING ],
            [ { glucose: 12.5, direction: 'NOT COMPUTABLE', noise: 4 }, analyser.STATUS_RISING ],
            [ { glucose: 15, direction: 'NOT COMPUTABLE', noise: 4 }, analyser.STATUS_RISING ]
        );
    });

    it('detects persistent high', () => {
        assertTimelineAnalysis(DAYTIME,
            // 12:00
            [ { glucose: 10, direction: 'FortyFiveUp' } ],
            [ { glucose: 11, direction: 'Flat' } ],
            [ { glucose: 11, direction: 'Flat' } ],
            [ { glucose: 11, direction: 'Flat' } ],
            [ { glucose: 11, direction: 'Flat' } ],
            [ { glucose: 11, direction: 'Flat' } ],
            [ { glucose: 11, direction: 'Flat' } ],
            [ { glucose: 11, direction: 'Flat' } ],
            [ { glucose: 11, direction: 'Flat' } ],
            [ { glucose: 11, direction: 'Flat' } ],
            [ { glucose: 11, direction: 'Flat' } ],
            [ { glucose: 11, direction: 'Flat' } ],
            // 13:00
            [ { glucose: 11, direction: 'Flat' } ],
            [ { glucose: 11, direction: 'Flat' } ],
            [ { glucose: 11, direction: 'Flat' } ],
            [ { glucose: 11, direction: 'Flat' } ],
            [ { glucose: 11, direction: 'Flat' } ],
            [ { glucose: 11, direction: 'Flat' } ],
            [ { glucose: 11, direction: 'Flat' } ],
            [ { glucose: 11, direction: 'Flat' } ],
            [ { glucose: 11, direction: 'Flat' } ],
            [ { glucose: 11, direction: 'Flat' } ],
            [ { glucose: 11, direction: 'Flat' } ],
            [ { glucose: 11, direction: 'Flat' } ],
            // 14:00
            [ { glucose: 11, direction: 'Flat' } ],
            [ { glucose: 11, direction: 'Flat' } ],
            [ { glucose: 11, direction: 'Flat' } ],
            [ { glucose: 11, direction: 'Flat' } ],
            [ { glucose: 11, direction: 'Flat' } ],
            [ { glucose: 11, direction: 'Flat' }, analyser.STATUS_PERSISTENT_HIGH ],
            [ { glucose: 12, direction: 'FortyFiveUp' }, analyser.STATUS_PERSISTENT_HIGH ],
            [ { glucose: 13, direction: 'FortyFiveUp' }, analyser.STATUS_PERSISTENT_HIGH ],
            [ { glucose: 14, direction: 'FortyFiveUp' }, analyser.STATUS_PERSISTENT_HIGH ],
            [ { glucose: 15, direction: 'FortyFiveUp' }, analyser.STATUS_PERSISTENT_HIGH ],
            [ { glucose: 16, direction: 'FortyFiveUp' }, analyser.STATUS_HIGH ], // "high" trumps "persistent high"
            [ { glucose: 12, direction: 'SingleDown' } ]
            // 15:00
        );
    });

    it('cancels persistent high for a single high value', () => {
        assertTimelineAnalysis(DAYTIME,
            // 12:00
            [ { glucose: 14, direction: 'FortyFiveUp' } ],
            [ { glucose: 14, direction: 'Flat' } ],
            [ { glucose: 14, direction: 'Flat' } ],
            [ { glucose: 14, direction: 'Flat' } ],
            [ { glucose: 14, direction: 'Flat' } ],
            [ { glucose: 14, direction: 'Flat' } ],
            [ { glucose: 14, direction: 'Flat' } ],
            [ { glucose: 14, direction: 'Flat' } ],
            [ { glucose: 14, direction: 'Flat' } ],
            [ { glucose: 14, direction: 'Flat' } ],
            [ { glucose: 14, direction: 'Flat' } ],
            [ { glucose: 14, direction: 'Flat' } ],
            // 13:00
            [ { glucose: 14, direction: 'Flat' } ],
            [ { glucose: 14, direction: 'Flat' } ],
            [ { glucose: 14, direction: 'Flat' } ],
            [ { glucose: 14, direction: 'Flat' } ],
            [ { glucose: 14, direction: 'Flat' } ],
            [ { glucose: 14, direction: 'Flat' } ],
            [ { glucose: 14, direction: 'Flat' } ],
            [ { glucose: 14, direction: 'Flat' } ],
            [ { glucose: 14, direction: 'Flat' } ],
            [ { glucose: 14, direction: 'Flat' } ],
            [ { glucose: 14, direction: 'Flat' } ],
            [ { glucose: 16, direction: 'Flat' }, analyser.STATUS_HIGH ], // here we briefly go HIGH
            // 14:00
            [ { glucose: 14, direction: 'Flat' } ],
            [ { glucose: 14, direction: 'Flat' } ],
            [ { glucose: 14, direction: 'Flat' } ],
            [ { glucose: 14, direction: 'Flat' } ],
            [ { glucose: 14, direction: 'Flat' } ],
            [ { glucose: 14, direction: 'Flat' } ], // ...so PERSISTENT_HIGH won't trigger here (otherwise it would)
            [ { glucose: 14, direction: 'Flat' } ],
            [ { glucose: 14, direction: 'Flat' } ],
            [ { glucose: 14, direction: 'Flat' } ],
            [ { glucose: 14, direction: 'Flat' } ],
            [ { glucose: 14, direction: 'Flat' } ],
            [ { glucose: 14, direction: 'Flat' } ],
            // 15:00
        );
    });

    it('cancels persistent high for a single low value', () => {
        assertTimelineAnalysis(DAYTIME,
            // 12:00
            [ { glucose: 14, direction: 'FortyFiveUp' } ],
            [ { glucose: 14, direction: 'Flat' } ],
            [ { glucose: 14, direction: 'Flat' } ],
            [ { glucose: 14, direction: 'Flat' } ],
            [ { glucose: 14, direction: 'Flat' } ],
            [ { glucose: 14, direction: 'Flat' } ],
            [ { glucose: 14, direction: 'Flat' } ],
            [ { glucose: 14, direction: 'Flat' } ],
            [ { glucose: 14, direction: 'Flat' } ],
            [ { glucose: 14, direction: 'Flat' } ],
            [ { glucose: 14, direction: 'Flat' } ],
            [ { glucose: 14, direction: 'Flat' } ],
            // 13:00
            [ { glucose: 14, direction: 'Flat' } ],
            [ { glucose: 14, direction: 'Flat' } ],
            [ { glucose: 14, direction: 'Flat' } ],
            [ { glucose: 14, direction: 'Flat' } ],
            [ { glucose: 14, direction: 'Flat' } ],
            [ { glucose: 14, direction: 'Flat' } ],
            [ { glucose: 14, direction: 'Flat' } ],
            [ { glucose: 14, direction: 'Flat' } ],
            [ { glucose: 14, direction: 'Flat' } ],
            [ { glucose: 14, direction: 'Flat' } ],
            [ { glucose: 14, direction: 'Flat' } ],
            [ { glucose: 9, direction: 'Flat' } ], // here we briefly go below HIGH_LEVEL_REL
            // 14:00
            [ { glucose: 14, direction: 'Flat' } ],
            [ { glucose: 14, direction: 'Flat' } ],
            [ { glucose: 14, direction: 'Flat' } ],
            [ { glucose: 14, direction: 'Flat' } ],
            [ { glucose: 14, direction: 'Flat' } ],
            [ { glucose: 14, direction: 'Flat' } ], // ...so PERSISTENT_HIGH won't trigger here (otherwise it would)
            [ { glucose: 14, direction: 'Flat' } ],
            [ { glucose: 14, direction: 'Flat' } ],
            [ { glucose: 14, direction: 'Flat' } ],
            [ { glucose: 14, direction: 'Flat' } ],
            [ { glucose: 14, direction: 'Flat' } ],
            [ { glucose: 14, direction: 'Flat' } ],
            // 15:00
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

function assertTimelineAnalysis(startTimestamp, ...expectedTimeline) {
    const actualTimeline = expectedTimeline.map((timelineEntry, i) => {
        const currentTimestamp = startTimestamp + i * TIMELINE_TICK;
        const entriesThusFar = expectedTimeline.slice(0, i + 1);
        const activeAlarmType = _.first(_.last(entriesThusFar)).activeAlarm;
        const snapshot = {
            currentTimestamp,
            activeProfile: PROFILE,
            latestEntries: (
                entriesThusFar
                    .map(([ { glucose, direction, noise } ], j) => ({
                        date: startTimestamp + j * TIMELINE_TICK,
                        direction,
                        nb_glucose_value: glucose,
                        noise: noise || 1
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
            latestAlarms: activeAlarmType ? [ { type: activeAlarmType } ] : []
        };
        const actualSituations = situationObjectToArray(analyser.analyseTimelineSnapshot(snapshot));
        return timelineEntry.slice(0, 1).concat(actualSituations)
    });
    assertEqual(actualTimeline, expectedTimeline);
}
