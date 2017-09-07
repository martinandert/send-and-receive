# send-and-receive

[![Travis build status](https://img.shields.io/travis/martinandert/send-and-receive/master.svg)](https://travis-ci.org/martinandert/send-and-receive)
[![no dependencies](https://img.shields.io/badge/dependencies-none-brightgreen.svg)](https://npmjs.com/package/send-and-receive)
[![license](https://img.shields.io/github/license/martinandert/send-and-receive.svg)](https://github.com/martinandert/send-and-receive/blob/master/LICENSE.txt)

Two small helper methods that simplify communication between nodes in different subtrees of the DOM.


## Installation

Install via npm:

```bash
% npm install send-and-receive
```

Or via yarn:

```bash
% yarn add send-and-receive
```

The UMD build is also available on [unpkg](https://unpkg.com/), adding a `sar` object to the global scope.

```html
<script src="https://unpkg.com/send-and-receive/dist/umd.min.js"></script>
```


## Usage

The module exports an object with several utility functions.

```js
var sar = require('send-and-receive');

sar.send('my:event', data);
```

If using ES modules, you can cherry-pick only the functions you're interested in:

```js
import { send, receive } from 'send-and-receive';

send('my:event', data);
```

Here is the complete API reference:


### sar.send

```js
send(string event[, any data])
```

TODO: add description and example.


### sar.receive

```js
object receive(string event, function callback[, object options])
```

TODO: add description and example.


## Contributing

Here's a quick guide:

1. Fork the repo and `make install` (assumes yarn is installed).
2. Run the tests. We only take pull requests with passing tests, and it's great to know that you have a clean slate: `make test`.
3. Add a test for your change. Only refactoring and documentation changes require no new tests. If you are adding functionality or are fixing a bug, we need a test!
4. Make the test pass.
5. Push to your fork and submit a pull request.


## Licence

Released under The MIT License.
