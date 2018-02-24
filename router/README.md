# Nightbear Router

The router uses [`lambda-multicast-proxy`](https://github.com/jareware/lambda-multicast-proxy) to implement an HTTP router, that receives sensor input and proxies it to one or more Nightbear environments.

## Initial setup

Refer to the [`lambda-multicast-proxy` setup instructions](https://github.com/jareware/lambda-multicast-proxy/blob/master/SETUP.md).

## Updating config

Make changes to [the config file](lambda-multicast-proxy-config.js), ensure you're authenticated with the AWS CLI, and:

```
$ aws lambda update-function-configuration \
    --function-name NightbearRouter \
    --environment $(node -p 'require("./lambda-multicast-proxy-config")')
```

Remember to commit & push changes afterwards.
