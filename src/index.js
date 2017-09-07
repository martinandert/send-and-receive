export function send(type, detail) {
  return dispatchEvent(new CustomEvent(type, { detail }));
}

export function receive(type, callback, { times = Number.POSITIVE_INFINITY } = {}) {
  let count = 0;

  const handler = (event) => {
    if (count < times) {
      count++;
      if (count === times) cancel();
      callback(event.detail);
    }
  };

  const cancel = () => removeEventListener(type, handler, false);
  const received = () => count;

  addEventListener(type, handler, false);

  return { cancel, received };
}

export function receiveOnce(type, callback, options = {}) {
  options.times = 1;

  return receive(type, callback, options);
}
