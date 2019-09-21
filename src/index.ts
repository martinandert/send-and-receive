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

export function send(type: string, data?: any) {
  return dispatchEvent(new CustomEvent(type, { detail: data }));
}

type Callback<T> = (data: T) => void;

interface ReceiveOptions {
  readonly limit: number;
}

const DEFAULT_RECEIVE_OPTIONS: ReceiveOptions = {
  limit: Number.POSITIVE_INFINITY,
};

export function receive<T>(
  type: string,
  callback: Callback<T>,
  { limit } = DEFAULT_RECEIVE_OPTIONS,
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

export function receiveOnce<T>(type: string, callback: Callback<T>): Subscription {
  return receive(type, callback, { limit: 1 });
}

type CreateResult<T> = readonly [
  (data: T) => ReturnType<typeof send>,
  (callback: Callback<T>, options?: ReceiveOptions) => ReturnType<typeof receive>,
];

export function create<T>(type: string): CreateResult<T> {
  return [
    function createdSend(data) {
      return send(type, data);
    },

    function createdReceive(callback, options = DEFAULT_RECEIVE_OPTIONS) {
      return receive(type, callback, options);
    },
  ];
}
