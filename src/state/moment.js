import {
  RetryAsyncObserver,
  RETRY_ASYNC_STATUSES,
} from "../utils/pubsub/domain";
import { getMoment } from "../utils/requests";
import { mergeWithRouter } from "./moments";

function getSpecificMomentObserver(id) {
  return RetryAsyncObserver(() => getMoment(id));
}

export const specificMoments = {};

export function initMoment(id) {
  if (!specificMoments[id]) {
    specificMoments[id] = getSpecificMomentObserver(id);
  }
}

export function specificMomentState(id) {
  initMoment(id);

  const specificMomentObserver = specificMoments[id];

  const observer = mergeWithRouter(specificMomentObserver);

  function clean() {
    specificMomentObserver.subscribe(({ status }, unsubscribe) => {
      if (status !== RETRY_ASYNC_STATUSES.READY) {
        specificMomentObserver.kill();
        specificMoments[id] = undefined;
      }
      unsubscribe();
    });
  }

  return { observer, clean };
}
