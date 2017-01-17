# iptable

An express middleware for filter ip, ip whitelist or blacklist.

## How to use

1. Install

  ```bash
  npm install iptable --save
  ```

2. Use it in express

  ```js
  var express = require('express');
  var iptable = require('iptable');

  var options = {
    filter: ['127.0.0.1', '192.168.??.2*', '!255.*.*.*', '!0.*.*.*'],
    status: 403,
    message: 'Please get out there.'
  };

  var app = express()

  app.use('/', function(req, res, next) {
    res.sendStatus(200);
  });
  
  var privateAPIRouter = express.Router();

  app.use('/private', privateAPIRouter);
  
  // All api based on privateAPIRouter will check HTTP request remote address.
  privateAPIRouter.use(iptable(options));
  
  privateAPIRouter.get('/info', function(req, res, next) {
    // handle info api.
  });

  app.listen(8080);

  ```

## Params

- `filter`: **(String|Array|Function|RegExp)**，specify ip regulation.
- `status`: **(Number)**, specify `response status` when the `client address is not allowed`.
- `message`: **(String)**, specify `response body`.
