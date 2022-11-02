<h1 align="left">teda</h1>

[![npm version][npm-src]][npm-href]
[![types][types-src]][types-href]
[![size][size-src]][size-href]
[![coverage][coverage-src]][coverage-href]
[![vulnerabilities][vulnerabilities-src]][vulnerabilities-href]
[![dependencies][dep-src]][dep-href]
[![devDependencies][devDep-src]][devDep-href]
[![License][license-src]][license-href]

> small middleware for logging HTTP requests

## Installation
```bash
$ npm i teda
```

## Usage
```js

import express from 'express';
import teda from 'teda';

const app = express();
app.use(teda(':method :url :status :content-length - :duration ms'));

app.get('/', (req, res) => {
    res.send('hello world!')
});
```

## Predefined Formats
### default
```
:remote-addr - [:date] ":method :url HTTP/:http-version" :status :content-length - :duration ms
```

### tiny
```
:method :url :status :content-length - :duration ms
```

## Tokens
* :remote-addr
* :method
* :url
* :http-version
* :user-agent
* :status
* :date
* :content-length
* :duration


## Licence
MIT License, see [LICENSE](./LICENSE)

[npm-src]: https://badgen.net/npm/v/teda
[npm-href]: https://www.npmjs.com/package/teda
[size-src]: https://badgen.net/packagephobia/install/teda
[size-href]: https://packagephobia.com/result?p=teda
[types-src]: https://badgen.net/npm/types/teda
[types-href]: https://www.npmjs.com/package/teda
[coverage-src]: https://coveralls.io/repos/github/sovrin/teda/badge.svg?branch=master
[coverage-href]: https://coveralls.io/github/sovrin/teda?branch=master
[vulnerabilities-src]: https://snyk.io/test/github/sovrin/teda/badge.svg
[vulnerabilities-href]: https://snyk.io/test/github/sovrin/teda
[dep-src]: https://badgen.net/david/dep/sovrin/teda
[dep-href]: https://badgen.net/david/dep/sovrin/teda
[devDep-src]: https://badgen.net/david/dev/sovrin/teda
[devDep-href]: https://badgen.net/david/dev/sovrin/teda
[license-src]: https://badgen.net/github/license/sovrin/teda
[license-href]: LICENSE
