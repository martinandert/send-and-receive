const noop = () => {};

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
  expect(2);

  var sub = sar.receive('my:event', noop);

  assert.equal(0, sub.received());

  sar.send('my:event', 'a');
  sar.send('my:event', 'b');

  assert.equal(2, sub.received());
});

it('can restrict how often to receive', () => {
  expect(4);

  var datas = [];

  var sub = sar.receive('my:event', (data) => {
    datas.push(data);
  }, { limit: 2 });

  sar.send('my:event', 'a');
  sar.send('my:event', 'b');
  sar.send('my:event', 'c');

  assert.equal(2, datas.length);
  assert.equal('a', datas[0]);
  assert.equal('b', datas[1]);
  assert.equal(2, sub.received(), 'was not received twice');
});

it('exports receiveOnce convenience method', () => {
  expect(1);

  var sub = sar.receiveOnce('my:event', noop);

  sar.send('my:event', 'a');
  sar.send('my:event', 'b');

  assert.equal(1, sub.received());
});

it('allows cancellation', () => {
  expect(1);

  var sub = sar.receive('my:event', noop);

  sar.send('my:event', 'a');
  sar.send('my:event', 'b');
  sub.cancel();
  sar.send('my:event', 'c');
  sar.send('my:event', 'd');

  assert.equal(2, sub.received());
});
