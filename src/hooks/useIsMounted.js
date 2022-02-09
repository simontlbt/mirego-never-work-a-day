import { useCallback, useEffect, useRef } from "react";
import { Observer } from "../utils/pubsub/observer";

export function useIsMounted() {
  const isMounted = useRef(true);

  useEffect(() => {
    return () => (isMounted.current = false);
  }, []);

  const isMounted_ = useCallback(() => {
    return isMounted.current;
  }, []);

  return isMounted_;
}

export function useObserveIsMounted() {
  const isMountedObserver = Observer();
  isMountedObserver.next(true);

  useEffect(() => {
    return () => isMountedObserver.next(false);
  }, []);

  return isMountedObserver;
}
