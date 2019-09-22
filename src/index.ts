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

export type Subscription = Readonly<Context>;

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

/**
 * Dispatches an event of the specified `type` with the
 * specified `data` (optional).
 *
 * @param type The name of the event.
 * @param data The optional payload of the event.
 * @example
 *
 * send('player:play', { src: 'song.mp3' });
 */
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

/**
 * Listens on dispatched events of the specified `type`
 * and, when it receives one, invokes `callback` with the
 * data passed when sending.
 *
 * @param type The name of the event.
 * @param callback The function to invoke.
 * @param options The configuration options.
 * @returns A subscription object.
 * @example
 *
 * const subscription = receive('player:play', (data) => {
 *   doSomethingWith(data);
 * });
 *
 * @description
 *
 * Use the returned subscription object to retrieve some
 * metadata or to cancel receiving further events:
 *
 * @example
 *
 * subscription.received  //=> How often has the event been received?
 * subscription.remaining //=> How many remaining events can it receive?
 *
 * subscription.cancelled //=> Did we completely opt out of receiving further events?
 * subscription.cancel()  //=> Unlisten from the event and set cancelled status.
 *
 * subscription.paused    //=> Did we temporarily stop receiving further events?
 * subscription.pause()   //=> Pause listening and set paused status.
 * subscription.resume()  //=> Resume listening and unset paused status.
 *
 * @description
 *
 * Note that both `subscription.pause()` and `subscription.resume()`
 * will throw an error if the subscription has been cancelled.
 *
 * By default, the number of events it can receive is not limited, which
 * means `subscription.remaining` will always return *positive infinity*.
 *
 * Besides calling `subscription.cancel()` in order to stop listening to
 * further events, you can also restrict the number of times the event
 * will be received by supplying the `limit` option:
 *
 * @example
 *
 * receive('player:play', callback, { limit: 1 });
 *
 * @description
 *
 * Here, after the event has been received once, it will be auto-cancelled.
 * Furthermore, the subscription's `received` property will have changed
 * from `0` to `1`, and the `remaining` property from `1` to `0`.
 */
export function receive<T>(
  type: string,
  callback: Callback<T>,
  { limit } = DEFAULT_RECEIVE_OPTIONS,
): Subscription {
  if (limit <= 0) {
    throw new RangeError('limit must be greater than 0');
  }

  const handler: EventListener = (event) => {
    if (context.received < limit) {
      context.received++;
      context.remaining--;

      if (context.remaining === 0) {
        context.cancel();
      }

      callback((event as CustomEvent).detail);
    }
  };

  const context: Context = {
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

  return createSubsription(context);
}

/**
 * A convenience method for the case when you want to receive
 * the event only once.
 *
 * @param type The name of the event.
 * @param callback The function to invoke.
 * @returns A subscription object.
 * @example
 *
 * receiveOnce('player:play', callback);
 *
 * @description
 *
 * This is semantically the same as calling `receive` with
 * `{ limit: 1 }` as options.
 */
export function receiveOnce<T>(type: string, callback: Callback<T>): Subscription {
  return receive(type, callback, { limit: 1 });
}

type CreateResult<T> = readonly [
  (data: T) => ReturnType<typeof send>,
  (callback: Callback<T>, options?: ReceiveOptions) => ReturnType<typeof receive>,
];

/**
 * A convenience method to create both a sender function and
 * a receiver function for the specified `type`.
 *
 * @param type The name of the event.
 * @returns An array of size 2, where the first element is the
 *   send function and the second element the receive function.
 *
 * @description
 *
 * This method is especially useful when coding in TypeScript,
 * as it allows strict-typing the `data`:
 *
 * @example
 *
 * // a.ts
 * import { create } from 'send-and-receive';
 *
 * const [sendPlay, receivePlay] = create<Song>('player:play');
 *
 * export { receivePlay };
 *
 * // later on (button click, etc.)
 * sendPlay({ src: 'song.mp3' });
 *
 * // b.ts
 * import { receivePlay } from './a.js';
 *
 * receivePlay((song) => {
 *   doSomethingWith(song.src);
 * });
 */
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
