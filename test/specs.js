var noop = () => {};

it('sends and receives data', () => {
  expect(3);

  var data = [];

  sar.receive('my:event', (datum) => {
    data.push(datum);
  });

  sar.send('my:event', 'hello');
  sar.send('my:event', { pi: Math.PI });

  assert.equal(2, data.length);
  assert.equal('hello', data[0]);
  assert.equal(Math.PI, data[1].pi);
});

it('exposes how often it received', () => {
  expect(4);

  var sub = sar.receive('my:event', noop);

  assert.equal(0, sub.received);
  assert.equal(Number.POSITIVE_INFINITY, sub.remaining);

  sar.send('my:event');
  sar.send('my:event');

  assert.equal(2, sub.received);
  assert.equal(Number.POSITIVE_INFINITY, sub.remaining);
});

it('can restrict how often to receive', () => {
  expect(6);

  var sub = sar.receive('my:event', noop, { limit: 2 });

  assert.equal(0, sub.received);
  assert.equal(2, sub.remaining);
  assert.equal(false, sub.cancelled);

  sar.send('my:event');
  sar.send('my:event');
  sar.send('my:event');

  assert.equal(2, sub.received);
  assert.equal(0, sub.remaining);
  assert.equal(true, sub.cancelled);
});

it('throws if passed limit is <= 0', () => {
  expect(2);

  thrown = 0;

  try {
    sar.receive('my:event', noop, { limit: 0 });
  } catch (e) {
    assert.equal('limit must be greater than 0', e.message);
    thrown++;
  }

  try {
    sar.receive('my:event', noop, { limit: -1 });
  } catch (e) {
    thrown++;
  }

  assert.equal(2, thrown);
});

it('exports receiveOnce convenience method', () => {
  expect(3);

  var sub = sar.receiveOnce('my:event', noop);

  assert.equal(1, sub.remaining);

  sar.send('my:event');

  assert.equal(0, sub.remaining);

  sar.send('my:event');

  assert.equal(1, sub.received);
});

it('exports create convenience method', () => {
  expect(3);

  var sendReceive = sar.create('my:event');
  var send = sendReceive[0];
  var receive = sendReceive[1];

  var data = [];

  const subscription = receive((datum) => {
    data.push(datum);
  });

  send('hello');
  send({ pi: Math.PI });

  subscription.cancel();

  send(42);

  assert.equal(2, data.length);
  assert.equal('hello', data[0]);
  assert.equal(Math.PI, data[1].pi);
});

it('allow custom data builder for create', () => {
  expect(2);

  var sendReceive = sar.create('history', function (url, action) {
    return action + '("' + url + '")';
  });

  var send = sendReceive[0];
  var receive = sendReceive[1];

  var data = [];

  receive((datum) => { data.push(datum) });

  send('/foo', 'push');

  assert.equal(1, data.length);
  assert.equal('push("/foo")', data[0]);
});

it('allows cancellation', () => {
  expect(4);

  var sub = sar.receive('my:event', noop);

  assert.equal(false, sub.cancelled);
  sar.send('my:event');
  assert.equal(1, sub.received);

  sub.cancel();

  assert.equal(true, sub.cancelled);
  sar.send('my:event');
  assert.equal(1, sub.received);
});

it('allows pausing and resuming', () => {
  expect(6);

  var sub = sar.receive('my:event', noop);

  assert.equal(false, sub.paused);
  sar.send('my:event');
  assert.equal(1, sub.received);

  sub.pause();

  assert.equal(true, sub.paused);
  sar.send('my:event');
  assert.equal(1, sub.received);

  sub.resume();

  assert.equal(false, sub.paused);
  sar.send('my:event');
  assert.equal(2, sub.received);
});

it('throws when pausing a cancelled subscription', () => {
  expect(1);

  var sub = sar.receive('my:event', noop);
  sub.cancel();

  try {
    sub.pause();
  } catch (e) {
    assert.equal('cannot pause a cancelled subscription', e.message);
  }
});

it('throws when resuming a cancelled subscription', () => {
  expect(1);

  var sub = sar.receive('my:event', noop);
  sub.cancel();

  try {
    sub.resume();
  } catch (e) {
    assert.equal('cannot resume a cancelled subscription', e.message);
  }
});

it('subscription properties are not writable', () => {
  expect(7);

  var sub = sar.receive('my:event', noop, { limit: 42 });

  sub.received = 123;
  assert.equal(0, sub.received);

  sub.remaining = 321;
  assert.equal(42, sub.remaining);

  sub.cancelled = true;
  assert.equal(false, sub.cancelled);

  var c = sub.cancel;
  sub.cancel = () => 'uhoh!';
  assert.equal(c, sub.cancel);

  sub.paused = true;
  assert.equal(false, sub.paused);

  var p = sub.pause;
  sub.pause = () => 'uhoh!';
  assert.equal(p, sub.pause);

  var r = sub.resume;
  sub.resume = () => 'uhoh!';
  assert.equal(r, sub.resume);
});

it('subscription properties are enumerable', () => {
  expect(8);

  var sub = sar.receive('my:event', noop);

  assert.equal(7, Object.keys(sub).length);

  var props = {};

  for (var prop in sub) {
    props[prop] = true;
  }

  assert.ok(props.received);
  assert.ok(props.remaining);
  assert.ok(props.cancelled);
  assert.ok(props.cancel);
  assert.ok(props.paused);
  assert.ok(props.pause);
  assert.ok(props.resume);
});
