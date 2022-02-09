import { wait } from "../timing";
import { Observer } from "./observer";
import { filter } from "./operators";
import { toPromise } from "./utils";

export function Timeout(seconds) {
  const timeout = Observer();

  (async () => {
    let remaining = seconds;

    for (; remaining >= 0; remaining--) {
      timeout.next({ retryIn: remaining });
      await wait(1000);
    }
  })();

  return timeout;
}

export const RETRY_ASYNC_STATUSES = {
  LOADING: "loading",
  WAITING_FOR_RETRY: "waiting_for_retry",
  READY: "ready",
};

export function RetryAsyncObserver(callback) {
  function makeStatus(status, payload = {}) {
    return { status, payload };
  }

  let isKilled = false;

  const LOADING_STATUS = makeStatus(RETRY_ASYNC_STATUSES.LOADING);

  const observer = Observer();
  observer.next(LOADING_STATUS);

  (async () => {
    let retryDelay = 2;

    while (true) {
      if (isKilled) {
        return;
      }

      try {
        const result = await callback();
        observer.next(makeStatus(RETRY_ASYNC_STATUSES.READY, result));
        break;
      } catch (e) {
        const timeout = Timeout(retryDelay);

        timeout.subscribe(({ retryIn }) => {
          observer.next(
            makeStatus(RETRY_ASYNC_STATUSES.WAITING_FOR_RETRY, {
              retryIn,
              error: e,
            })
          );
        });

        await toPromise(observer.pipe(filter(({ retryIn }) => retryIn === 0)));

        observer.next(LOADING_STATUS);

        retryDelay *= 2;
        retryDelay = Math.min(retryDelay, 60);
      }
    }
  })();

  observer.kill = () => {
    isKilled = true;
  };

  return observer;
}
