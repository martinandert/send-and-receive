export function send(type, detail) {
  return window.dispatchEvent(new CustomEvent(type, { detail }));
}

export function receive(type, callback, { times = Number.POSITIVE_INFINITY } = {}) {
  let count = 0;

  const handler = (event) => {
    if (count < times) {
      count++;
      callback(event.detail);
    } else {
      cancel();
    }
  };

  const cancel = () => window.removeEventListener(type, handler, false);
  const received = () => count;

  window.addEventListener(type, handler, false);

  return { cancel, received };
}

export function receiveOnce(type, callback, options = {}) {
  options.times = 1;

  return receive(type, callback, options);
}
