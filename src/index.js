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
  defineProperty(this, 'paused', () => context.paused);
  defineProperty(this, 'pause', () => context.pause);
  defineProperty(this, 'resume', () => context.resume);
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
    cancel() {
      if (context.cancelled) return;
      removeEventListener(type, handler, false);
      context.cancelled = true;
    },

    paused: false,
    pause() {
      if (context.cancelled) {
        throw new Error('cannot pause a cancelled subscription');
      }

      if (context.paused) return;
      removeEventListener(type, handler, false);
      context.paused = true;
    },
    resume() {
      if (context.cancelled) {
        throw new Error('cannot resume a cancelled subscription');
      }

      if (!context.paused) return;
      addEventListener(type, handler, false);
      context.paused = false;
    },
  };

  addEventListener(type, handler, false);

  return new Subscription(context);
}

export function receiveOnce(type, callback, options = {}) {
  options.limit = 1;

  return receive(type, callback, options);
}
