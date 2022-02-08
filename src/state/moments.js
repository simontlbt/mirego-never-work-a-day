import { useCallback } from "react";
import { useIsMounted } from "../hooks/useIsMounted";
import { getMoments } from "../utils/requests";
import { State } from "./state";

const useMoments_ = State({ moments: null });

export function useMoments() {
  const [moments, setMoments] = useMoments_();

  const isMounted = useIsMounted();

  const init = useCallback(async () => {
    const moments_ = await getMoments();

    if (!isMounted()) {
      return;
    }

    setMoments({ moments: moments_ });
  }, []);

  return [moments, { init }];
}
