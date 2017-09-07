# send-and-receive

[![Travis build status](https://img.shields.io/travis/martinandert/send-and-receive/master.svg)](https://travis-ci.org/martinandert/send-and-receive)
[![no dependencies](https://img.shields.io/badge/dependencies-none-brightgreen.svg)](https://npmjs.com/package/send-and-receive)
[![license](https://img.shields.io/github/license/martinandert/send-and-receive.svg)](https://github.com/martinandert/send-and-receive/blob/master/LICENSE.txt)

Two small helper methods that simplify communication between nodes in different subtrees of the browser DOM.

Under the hood, `send()` [dispatches](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/dispatchEvent)
instances of [`CustomEvent`](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent), using `window` as
the event target. `receive()` simply [listens](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener) on
`window` for dispatched events.

Note: IE 9/10/11 has [only partial support](http://caniuse.com/#search=CustomEvent) for the
CustomEvent interface. You can use a polyfill like [krambuhl/custom-event-polyfill](https://github.com/krambuhl/custom-event-polyfill) to fix it.


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

Using a browser packager like Webpack or Rollup, you can cherry-pick only the functions you're interested in:

```js
import { send, receive } from 'send-and-receive';

receive('my:event', (data) => {
  // do something with data
});

send('my:event', data);
```

If using the UMD build added via `<script src>`, call the methods on the exposed `sar` object:

```html
<script>
  sar.send(/* ... */);
  sar.receive(/*... */);
</script>
```

Here is the complete API reference:


### sar.send

```js
send(string event[, any data])
```

Dispatches an event with optional data.

```js
sar.send('player:play', {
  src: 'https://example.org/song.mp3',
  title: 'Example song'
});
```


### sar.receive

```js
object receive(string event, function callback[, object options])
```

Listens on dispatched events of the specified type and invokes `callback(data)` when it receives one.

```js
const subscription = sar.receive('player:play', (data) => {
  console.log('Now playing ' + data.title);
  somePlayer.play(data.url);
});
```

Use the returned object to retrieve how often the event has been received or to cancel receiving further events:

```js
subscription.received() //=> returns an integer >= 0
subscription.cancel() //=> unlistens from the event
```

Besides calling `cancel()`, in order to restrict the number of times the event will be received, you can also use the `times` option:

```js
sar.receive('player:play', callback, { times: 1 });
```

This auto-cancels listening to the event after it has been received once.


### sar.receiveOnce (bonus method)

```js
object receiveOnce(string event, function callback)
```

A convenience method for the case when you want to receive the event only once.

```js
sar.receiveOnce('player:play', callback);
```

This is semantically the same as the last example above.


## Contributing

Here's a quick guide:

1. Fork the repo and `make install` (assumes yarn is installed).
2. Run the tests. We only take pull requests with passing tests, and it's great to know that you have a clean slate: `make test`.
3. Add a test for your change. Only refactoring and documentation changes require no new tests. If you are adding functionality or are fixing a bug, we need a test!
4. Make the test pass.
5. Push to your fork and submit a pull request.


## Licence

Released under The MIT License.
