export function getLatestCalibration() {
    return {
        "device": "dexcom",
        "scale": 1,
        "dateString": "Sat Nov 28 13:42:28 EET 2015",
        "date": Date.now(),
        "type": "cal",
        "intercept": 30923.080292889048,
        "slope": 846.2368050082694
    };
}

export function getDataForAnalysis() {
    return [
        {
            "unfiltered": 158880,
            "filtered": 156608,
            "direction": "Flat",
            "device": "dexcom",
            "rssi": 168,
            "sgv": 300,
            "dateString": "Sun Nov 22 23:27:50 EET 2015",
            "type": "sgv",
            "date": Date.now(),
            "noise": 1
        }
    ];
}

export function getActiveAlarms() {
    return [];
}
