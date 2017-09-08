# send-and-receive

[![Travis build status](https://img.shields.io/travis/martinandert/send-and-receive/master.svg)](https://travis-ci.org/martinandert/send-and-receive)
[![no dependencies](https://img.shields.io/badge/dependencies-none-brightgreen.svg)](https://npmjs.com/package/send-and-receive)
[![license](https://img.shields.io/github/license/martinandert/send-and-receive.svg)](https://github.com/martinandert/send-and-receive/blob/master/LICENSE.txt)

Two small helper methods that simplify communication between nodes in different subtrees of the browser DOM.

See it in action in [this little JS Bin demo](https://jsbin.com/rijekotuna/1/edit?js,output) (run with JS enabled).

Under the hood, `send()` [dispatches](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/dispatchEvent) instances of [`CustomEvent`](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent), using `window` as the event target. `receive()` simply [listens](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener) on `window` for dispatched events.

Note: IE 9/10/11 has [only partial support](http://caniuse.com/#search=CustomEvent) for the `CustomEvent` interface. You can use a polyfill like [krambuhl/custom-event-polyfill](https://github.com/krambuhl/custom-event-polyfill) to fix it.


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
  somePlayer.play(data.src);
});
```

Use the returned object to retrieve some metadata or to cancel receiving further events:

```js
subscription.received  //=> How often has the event been received?
subscription.remaining //=> How many remaining events can it receive?

subscription.cancelled //=> Did we completely opt out of receiving further events?
subscription.cancel()  //=> Unlisten from the event and set cancelled status.

subscription.paused    //=> Did we temporarily stop receiving further events?
subscription.pause()   //=> Pause listening and set paused status.
subscription.resume()  //=> Resume listening and unset paused status.
```

Note that both `subscription.pause()` and `subscription.resume()` will throw an error if the subscription has been cancelled.

By default, the number of events it can receive is not limited, which means `subscription.remaining` will always return *positive infinity*.

Besides calling `subscription.cancel()` in order to stop listening to further events, you can also restrict the number of times the event will be received by supplying the `limit` option:

```js
sar.receive('player:play', callback, { limit: 1 });
```

Here, after the event has been received once, it will be auto-cancelled. Furthermore, the subscription's `received` property will have changed from `0` to `1`, and the `remaining` property from `1` to `0`.


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
