function defineProperty(obj: any, name: string, getter: () => any) {
  Object.defineProperty(obj, name, {
    get: getter,
    enumerable: true,
    configurable: false,
  });
}

interface Context {
  received: number;
  remaining: number;
  cancelled: boolean;
  cancel: () => void;
  paused: boolean;
  pause: () => void;
  resume: () => void;
}

type Subscription = Readonly<Context>;

function createSubsription(context: Context): Subscription {
  const subscription = {};

  defineProperty(subscription, 'received', () => context.received);
  defineProperty(subscription, 'remaining', () => context.remaining);
  defineProperty(subscription, 'cancelled', () => context.cancelled);
  defineProperty(subscription, 'cancel', () => context.cancel);
  defineProperty(subscription, 'paused', () => context.paused);
  defineProperty(subscription, 'pause', () => context.pause);
  defineProperty(subscription, 'resume', () => context.resume);

  return subscription as Subscription;
}

export function send(type: string, detail?: any) {
  return dispatchEvent(new CustomEvent(type, { detail }));
}

type Callback = (detail: unknown) => void;

interface ReceiveOptions {
  readonly limit?: number;
}

export function receive(
  type: string,
  callback: Callback,
  { limit = Number.POSITIVE_INFINITY }: ReceiveOptions = {},
): Subscription {
  if (limit <= 0) {
    throw new RangeError('limit must be greater than 0');
  }

  const handler = (event: CustomEvent) => {
    if (context.received < limit) {
      context.received++;
      context.remaining--;

      if (context.remaining === 0) {
        context.cancel();
      }

      callback(event.detail);
    }
  };

  const context: Context = {
    received: 0,
    remaining: limit,

    cancelled: false,
    cancel() {
      if (context.cancelled) return;
      removeEventListener(type, handler as EventListener, false);
      context.cancelled = true;
    },

    paused: false,
    pause() {
      if (context.cancelled) {
        throw new Error('cannot pause a cancelled subscription');
      }

      if (context.paused) return;
      removeEventListener(type, handler as EventListener, false);
      context.paused = true;
    },
    resume() {
      if (context.cancelled) {
        throw new Error('cannot resume a cancelled subscription');
      }

      if (!context.paused) return;
      addEventListener(type, handler as EventListener, false);
      context.paused = false;
    },
  };

  addEventListener(type, handler as EventListener, false);

  return createSubsription(context);
}

export function receiveOnce(type: string, callback: Callback): Subscription {
  return receive(type, callback, { limit: 1 });
}
