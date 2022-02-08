import { useCallback, useEffect, useRef } from "react";

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
