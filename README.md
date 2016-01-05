# nightbear

[![Build Status](https://travis-ci.org/marjakapyaho/nightbear.svg?branch=master)](https://travis-ci.org/marjakapyaho/nightbear)

This is the documentation for nightbear which includes code for:
* nightbear server
* Pebble watchface
* React UI with (possible upcoming) wrappers for iOS and Android

## Getting test data from Nightscout

start = new Date(2016, 0, 5, 10, 49, 0).getTime()
end = new Date(2016, 0, 5, 11, 49, 0).getTime()

YOUR_NIGHTSCOUT_BASE_URL/api/v1/entries.json?count=20&find[date][$gte]=start&find[date][$lte]=end
