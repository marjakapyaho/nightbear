# Nightbear Server

## Dev env setup

Create a local DB:

```
$ docker run -d -p 5984:5984 --name nightbear-test-couchdb apache/couchdb:2.1.0
$ open http://localhost:5984/_utils/#/setup
```

Create a single node, with credentials `admin:admin`.
