# Nightscout API Samples

## Sensor entries

```
POST /api/v1/entries

{
    "device": "dexcom",
    "sgv": 135,
    "dateString": "Sun Nov 22 23:27:50 EET 2015",
    "type": "sgv",
    "date": 1448227670000,
    "direction": "Flat"
}
```

## Sensor entries (with opt fields)

```
POST /api/v1/entries

{
    "unfiltered": 158880,
    "filtered": 156608,
    "direction": "Flat",
    "device": "dexcom",
    "rssi": 168,
    "sgv": 135,
    "dateString": "Sun Nov 22 23:27:50 EET 2015",
    "type": "sgv",
    "date": 1448227670000,
    "noise": 1
}
```

## Manual meter entries

```
POST /api/v1/entries

{
    "device": "dexcom",
    "dateString": "Sun Nov 22 18:13:12 EET 2015",
    "mbg": 63,
    "date": 1448208792000,
    "type": "mbg"
}
```

## Uploader status updates

```
POST /api/v1/devicestatus

{
    "uploaderBattery": 100
}
```
