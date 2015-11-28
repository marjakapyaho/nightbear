# Related formulae

## Interpreting raw data

Current blood glucose from the latest calibration entry (`cal`) and the latest regular entry (`entry`):

```
cal.scale * (entry.unfiltered - cal.intercept) / cal.slope
```

[1](https://gitter.im/nightscout/beta/archives/2014/10/13)
