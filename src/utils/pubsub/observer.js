import { None, Some } from "../dataStructures";

export function Observer() {
  let currentValue = arguments.length > 0 ? Some(arguments[0]) : None();
  const subscriptions = [];

  function pipe(makeObserver) {
    return makeObserver({
      pipe,
      subscribe,
      next,
    });
  }

  function subscribe(callback) {
    const subscriptionIndex = subscriptions.length;

    subscriptions.push(callback);

    if (currentValue.hasValue) {
      callback(
        currentValue.value,
        () => (subscriptions[subscriptionIndex] = undefined)
      );
    }

    return {
      unsubscribe: () => {
        subscriptions[subscriptionIndex] = undefined;
      },
    };
  }

  function next(value) {
    currentValue = Some(value);

    for (const [index, subscription] of subscriptions.entries()) {
      if (subscription) {
        subscription(value, () => {
          subscriptions[index] = undefined;
        });
      }
    }
  }

  return {
    pipe,
    subscribe,
    next,
  };
}
