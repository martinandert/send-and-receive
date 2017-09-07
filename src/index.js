export function send(type, detail) {
  return dispatchEvent(new CustomEvent(type, { detail }));
}

export function receive(type, callback, { limit = Number.POSITIVE_INFINITY } = {}) {
  let count = 0;

  const handler = (event) => {
    if (count < limit) {
      count++;
      if (count === limit) cancel();
      callback(event.detail);
    }
  };

  const cancel = () => removeEventListener(type, handler, false);
  const received = () => count;

  addEventListener(type, handler, false);

  return { cancel, received };
}

export function receiveOnce(type, callback, options = {}) {
  options.limit = 1;

  return receive(type, callback, options);
}
