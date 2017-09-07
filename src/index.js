const defaultTarget = window;

export function send(type, detail, { target = defaultTarget } = {}) {
  return target.dispatchEvent(new CustomEvent(type, { detail }));
}

export function receive(type, callback, { target = defaultTarget, times = Number.POSITIVE_INFINITY } = {}) {
  let count = 0;

  const handler = (event) => {
    if (count < times) {
      count++;
      callback(event.detail);
    } else {
      cancel();
    }
  };

  const cancel = () => target.removeEventListener(type, handler, false);
  const received = () => count;

  target.addEventListener(type, handler, false);

  return { cancel, received };
}

export function receiveOnce(type, callback, options = {}) {
  options.times = 1;

  return receive(type, callback, options);
}
