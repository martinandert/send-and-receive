function defineProperty(obj, name, getter) {
  Object.defineProperty(obj, name, {
    get: getter,
    enumerable: true,
    configurable: false,
  });
}

function Subscription(context) {
  defineProperty(this, 'received', () => context.received);
  defineProperty(this, 'remaining', () => context.remaining);
  defineProperty(this, 'cancelled', () => context.cancelled);
  defineProperty(this, 'cancel', () => context.cancel);
}

export function send(type, detail) {
  return dispatchEvent(new CustomEvent(type, { detail }));
}

export function receive(type, callback, { limit = Number.POSITIVE_INFINITY } = {}) {
  if (limit <= 0) {
    throw new RangeError('limit must be greater than 0');
  }

  const handler = (event) => {
    if (context.received < limit) {
      context.received++;
      context.remaining--;

      if (context.remaining === 0) {
        context.cancel();
      }

      callback(event.detail);
    }
  };

  const context = {
    received: 0,
    remaining: limit,
    cancelled: false,
    cancel: () => {
      removeEventListener(type, handler, false);
      context.cancelled = true;
    }
  }

  addEventListener(type, handler, false);

  return new Subscription(context);
}

export function receiveOnce(type, callback, options = {}) {
  options.limit = 1;

  return receive(type, callback, options);
}
