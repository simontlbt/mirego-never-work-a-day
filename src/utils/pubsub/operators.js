import { None, Some } from "../dataStructures";
import { Observer } from "./observer";

export function map(callback) {
  return (observer) => {
    const observer_ = Observer();

    observer.subscribe((value) => {
      const mapResult = callback(value);

      observer_.next(mapResult);
    });

    return observer_;
  };
}

export function filter(callback) {
  return (observer) => {
    const observer_ = Observer();

    observer.subscribe((value) => {
      if (callback(value)) {
        observer_.next(value);
      }
    });

    return observer_;
  };
}

export function combine() {
  return (observer) => {
    let newObserver = Observer();

    const currentObservers = [observer, ...arguments].map((observer_) => ({
      value: None(),
      observer: observer_,
    }));

    const sendIfPossible = () => {
      const values = currentObservers.map((item) => item.value);

      if (values.find((value) => !value.hasValue)) {
        return;
      }

      newObserver.next(values.map((value) => value.value));
    };

    for (const [i, { observer: observer_ }] of currentObservers.entries()) {
      observer_.subscribe((value) => {
        currentObservers[i].value = Some(value);

        sendIfPossible();
      });
    }

    return newObserver;
  };
}

export function scan(callback, state) {
  return (observer) => {
    let currentState = state;

    const observer_ = Observer();

    observer.subscribe((value) => {
      const [nextValue, nextState] = callback([value, currentState]);

      observer_.next(nextValue);

      currentState = nextState;
    });

    return observer_;
  };
}
