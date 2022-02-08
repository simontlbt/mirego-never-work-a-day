import { useEffect, useRef, useState } from "react";
import { useHistory } from "./hooks/useHistory";
import { useIsMounted } from "./hooks/useIsMounted";
import { useRerender } from "./hooks/useRerender";
import { useRouterState } from "./state/router";
import { clsx } from "./utils/classnames";
import { wait } from "./utils/wait";

const STATUSES = {
  SHOWN: "shown",
  FADE_OUT: "fade_out",
};

export function Router({
  classname,
  routes,
  transitionDelay = 1000,
  firstRenderDelay = 600,
}) {
  const history = useHistory();

  const [_, setRouterState] = useRouterState();
  const rerender = useRerender();
  const isMounted = useIsMounted();

  const history_ = useRef(history);

  const [status, setStatus] = useState(STATUSES.SHOWN);

  const [canDisplay, setCanDisplay] = useState(false);

  useEffect(async () => {
    if (history.url === history_.current.url) {
      history_.current = history;
      rerender();
    } else {
      setRouterState({ isTransitioning: true });
      setStatus(STATUSES.FADE_OUT);

      await wait(transitionDelay);

      if (!isMounted()) {
        return;
      }

      history_.current = history;

      setRouterState({ isTransitioning: false });

      setStatus(STATUSES.SHOWN);
    }
  }, [history]);

  const [match, Route] = routes
    .map(([pattern, route]) => [history_.current.url.match(pattern), route])
    .find(([pattern]) => pattern);

  useEffect(async () => {
    await wait(firstRenderDelay);

    if (!isMounted()) {
      return;
    }

    setRouterState({ isTransitioning: false });

    setCanDisplay(true);
  }, []);

  if (!canDisplay) {
    return <div></div>;
  }

  return (
    <div
      className={clsx(classname, { fade_out: status === STATUSES.FADE_OUT })}
    >
      <Route history={history_.current} match={match} />
    </div>
  );
}
