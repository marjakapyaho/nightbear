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

SGV ~= "Sensor Glucose Value".

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

All keys are equal to what the Nightscout server will give back with `GET /api/v1/entries`, with only `_id` added.

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

MBG ~= "Metered Blood Glucose".

## Calibration data from Dexcom

```
POST /api/v1/entries
{
    "device": "dexcom",
    "scale": 1,
    "dateString": "Sat Nov 28 13:42:28 EET 2015",
    "date": 1448710948000,
    "type": "cal",
    "intercept": 30923.080292889048,
    "slope": 846.2368050082694
}
```

## Uploader status updates

```
POST /api/v1/devicestatus

{
    "uploaderBattery": 100
}
```

## Treatments

```
GET /api/v1/treatments

[
    {
        "_id": "5662e432a99d8a010010c3a2",
        "enteredBy": "Someone",
        "eventType": "BG Check",
        "glucose": 17.5,
        "glucoseType": "Finger",
        "notes": "(testing bg)",
        "units": "mmol",
        "created_at": "2015-12-05T13:18:42.202Z"
    },
    {
        "_id": "5662e3dfa99d8a010010c3a1",
        "enteredBy": "Someone",
        "eventType": "Correction Bolus",
        "insulin": 3,
        "notes": "(testing insulin)",
        "created_at": "2015-12-05T12:30:00.000Z"
    },
    {
        "_id": "5662e35ba99d8a010010c39f",
        "enteredBy": "Someone",
        "eventType": "Carb Correction",
        "carbs": 50,
        "notes": "(testing carbs)",
        "created_at": "2015-12-05T11:30:00.000Z"
    }
]
```
