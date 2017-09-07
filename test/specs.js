var noop = () => {};

it('sends and receives', () => {
  expect(3);

  var datas = [];

  sar.receive('my:event', (data) => {
    datas.push(data);
  });

  sar.send('my:event', 'hello');
  sar.send('my:event', { pi: Math.PI });

  assert.equal(2, datas.length);
  assert.equal('hello', datas[0]);
  assert.equal(Math.PI, datas[1].pi);
});

it('exposes how often it received', () => {
  expect(4);

  var sub = sar.receive('my:event', noop);

  assert.equal(0, sub.received);
  assert.equal(Number.POSITIVE_INFINITY, sub.remaining);

  sar.send('my:event', 'a');
  sar.send('my:event', 'b');

  assert.equal(2, sub.received);
  assert.equal(Number.POSITIVE_INFINITY, sub.remaining);
});

it('can restrict how often to receive', () => {
  expect(6);

  var sub = sar.receive('my:event', noop, { limit: 2 });

  assert.equal(0, sub.received);
  assert.equal(2, sub.remaining);
  assert.equal(false, sub.cancelled);

  sar.send('my:event', 'a');
  sar.send('my:event', 'b');
  sar.send('my:event', 'c');

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
  expect(2);

  var sub = sar.receiveOnce('my:event', noop);

  assert.equal(1, sub.remaining);

  sar.send('my:event', 'a');
  sar.send('my:event', 'b');

  assert.equal(1, sub.received);
});

it('allows cancellation', () => {
  expect(4);

  var sub = sar.receive('my:event', noop);

  sar.send('my:event', 'a');
  sar.send('my:event', 'b');

  assert.equal(2, sub.received);

  assert.equal(false, sub.cancelled);
  sub.cancel();
  assert.equal(true, sub.cancelled);

  sar.send('my:event', 'c');
  sar.send('my:event', 'd');

  assert.equal(2, sub.received);
});

it('subscription properties are not writable', () => {
  expect(4);

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
});

it('subscription properties are enumerable', () => {
  expect(5);

  var sub = sar.receive('my:event', noop);

  assert.equal(4, Object.keys(sub).length);

  var props = {};

  for (var prop in sub) {
    props[prop] = true;
  }

  assert.ok(props.received);
  assert.ok(props.remaining);
  assert.ok(props.cancelled);
  assert.ok(props.cancel);
});
