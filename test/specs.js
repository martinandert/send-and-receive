it('sends and receives', function() {
  expect(3);

  var datas = [];

  sar.receive('my:event', function(data) {
    datas.push(data);
  });

  sar.send('my:event', 'hello');
  sar.send('my:event', Math.PI);

  assert.equal(2, datas.length);
  assert.equal('hello', datas[0]);
  assert.equal(Math.PI, datas[1]);
});

it('exposes how often it received', function() {
  expect(1);

  var sub = sar.receive('my:event', () => {});

  sar.send('my:event', 'a');
  sar.send('my:event', 'b');
  sar.send('my:event', 'c');

  assert.equal(3, sub.received());
});

it('can specify how often to receive', function() {
  expect(4);

  var datas = [];

  var sub = sar.receive('my:event', function(data) {
    datas.push(data);
  }, { times: 2 });

  sar.send('my:event', 'a');
  sar.send('my:event', 'b');
  sar.send('my:event', 'c');

  assert.equal(2, datas.length);
  assert.equal('a', datas[0]);
  assert.equal('b', datas[1]);
  assert.equal(2, sub.received(), 'was not received twice');
});

it('exports receiveOnce convenience method', function() {
  expect(1);

  var datas = [];

  var sub = sar.receiveOnce('my:event', () => {});

  sar.send('my:event', 'a');
  sar.send('my:event', 'b');

  assert.equal(1, sub.received());
});

it('allows cancellation', function() {
  expect(1);

  var sub = sar.receive('my:event', () => {});

  sar.send('my:event', 'a');
  sar.send('my:event', 'b');
  sub.cancel();
  sar.send('my:event', 'c');
  sar.send('my:event', 'd');

  assert.equal(2, sub.received());
});
