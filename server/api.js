export function nightscoutUploaderPost(data) {
    console.log('nightscoutUploaderPost()', data);

    var type = data.type;

    if (type === 'sgv') {
        // Save data to sgv
    }
    else if (type === 'mbg') {
        // Save data to mbg
    }
    else if (type === 'cal') {
        // Save data to cal
    }

    return Promise.resolve();
}

export function getLegacyEntries() {

    // Get real data from sgv & treatments (12h)

    // Change format to legacy

    return Promise.resolve([
        {
            "time": 1448816243000,
            "insulin": 4,
            "carbs": 30
        },
        {
            "time": 1448816543000,
            "sugar": "15.5"
        },
        {
            "time": 1448816843000,
            "sugar": "15.5"
        },
        {
            "time": 1448817143000,
            "sugar": "15.5"
        }
    ]);
}
