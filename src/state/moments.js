import { routerObserver } from "./router";
import {
  RetryAsyncObserver,
  RETRY_ASYNC_STATUSES,
} from "../utils/pubsub/domain";
import { Observer } from "../utils/pubsub/observer";
import { combine, scan } from "../utils/pubsub/operators";
import { wait } from "../utils/timing";
import { Lazy } from "../utils/lazy";
import { getMoments } from "../utils/requests";

export const momentsObserver = Lazy(() => RetryAsyncObserver(getMoments));

export function mergeWithRouter(observer) {
  const timeoutCompleteObserver = Observer(false);

  const observer_ = observer
    .pipe(combine(routerObserver, timeoutCompleteObserver))
    .pipe(
      scan(([value, state]) => {
        const [items, { isTransitioning }, isTimeoutComplete] = value;

        const { status } = items;

        let state_ = state;
        let status_ = status;

        if (!state) {
          state_ = {
            mustDelay: status != RETRY_ASYNC_STATUSES.READY && isTransitioning,
          };
        }

        if (status === RETRY_ASYNC_STATUSES.READY && !state_.isDelaying) {
          if (isTransitioning) {
            state_ = { mustDelay: false };
          } else {
            if (state_.mustDelay) {
              state_.isDelaying = true;
              (async () => {
                await wait(1000);

                timeoutCompleteObserver.next(true);
              })();
            }
          }
        }

        if (state_.isDelaying) {
          if (!isTimeoutComplete) {
            status_ = RETRY_ASYNC_STATUSES.LOADING;
          }
        }

        return [{ ...items, status: status_ }, state_];
      })
    );

  return observer_;
}

export function momentsState() {
  const observer = mergeWithRouter(momentsObserver.get());

  function clean() {
    momentsObserver.get().subscribe(({ status }, unsubscribe) => {
      if (status !== RETRY_ASYNC_STATUSES.READY) {
        momentsObserver.get().kill();
        momentsObserver.reset();
      }
      unsubscribe();
    });
  }

  return { observer, clean };
}
