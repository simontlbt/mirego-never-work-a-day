import { useRef, useState } from "react";
import { times } from "../utils/times";
import { pushState } from "../hooks/useHistory";
import "./moments.scss";
import { useMoments } from "../state/moments";
import { useEffect } from "react/cjs/react.development";
import { wait } from "@testing-library/user-event/dist/utils";
import { useRouterState } from "../state/router";
import { useIsMounted } from "../hooks/useIsMounted";
import Skeleton from "react-loading-skeleton";
import { clsx } from "../utils/classnames";
import { useMoment } from "../state/moment";

function Moment({ i, isShown, data }) {
  const [_, { init }] = useMoment();

  const goToMoment = (id) => {
    init(id);
    pushState({ state: { preInit: true }, url: `/moment/${id}` });
  };
  return (
    <div
      onClick={isShown ? () => goToMoment(data.id) : undefined}
      className="moments__moment"
      style={{ animationDelay: i * 150 + "ms" }}
    >
      <div className="moments__moment__picture">
        <div
          className="moments__moment__picture__inner"
          style={{ backgroundImage: isShown && `url(${data.media.large})` }}
        >
          {!isShown && <Skeleton height="100%" />}
        </div>
      </div>
      <div className="moments__moment__content">
        <div className="moments__moment__header">
          <div className="moments__moment__title">
            {isShown ? data.description : <Skeleton count={2} />}
          </div>
          <div
            className="moments__moment__author"
            style={{
              backgroundImage: isShown && `url(${data.user.avatar.large})`,
            }}
          >
            {!isShown && <Skeleton height="100%" />}
          </div>
        </div>
        <div className="moments__moment__under">
          <div className="moments__moment__comments">
            {isShown ? `${data.comments_count} commentaires` : <Skeleton />}
          </div>
          <div
            className={clsx("moments__moment__organization", {
              "moments__moment__organization--shown": isShown,
            })}
          >
            {isShown ? `Par ${data.organization.name}` : <Skeleton />}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Moments() {
  const [{ moments }, { init }] = useMoments();
  const [{ isTransitioning }] = useRouterState();

  const isMounted = useIsMounted();

  const isLoading = useRef(false);
  const [isShown, setIsShown] = useState(false);

  useEffect(async () => {
    if (!moments) {
      if (isLoading.current) {
        return;
      }
      isLoading.current = true;
      init();
    } else {
      if (!isTransitioning && isLoading.current) {
        await wait(1000);
      }

      if (!isMounted()) {
        return;
      }

      setIsShown(true);
    }
  }, [moments, isTransitioning]);

  const moments_ = moments || times(10);

  return (
    <div className="moments">
      {moments_.map((moment, i) => (
        <Moment key={i} i={i} data={moment} isShown={isShown} />
      ))}
    </div>
  );
}
