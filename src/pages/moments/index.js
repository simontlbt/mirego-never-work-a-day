import { useState } from "react";
import { times } from "../../utils/times";
import { pushState } from "../../hooks/useHistory";
import { useEffect } from "react/cjs/react.development";
import { useObserveIsMounted } from "../../hooks/useIsMounted";
import Skeleton from "react-loading-skeleton";
import { clsx } from "../../utils/classnames";
import { combine } from "../../utils/pubsub/operators";
import { RETRY_ASYNC_STATUSES } from "../../utils/pubsub/domain";
import { momentsState } from "../../state/moments";

import "./index.scss";
import { initMoment } from "../../state/moment";

function Moment({ i, isShown, data }) {
  const goToMoment = (id) => {
    initMoment(id);
    pushState({ url: `/moment/${id}` });
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
  const isMountedObserver = useObserveIsMounted();
  const [moments, setMoments] = useState(undefined);

  useEffect(() => {
    const { observer, clean } = momentsState();

    observer
      .pipe(combine(isMountedObserver))
      .subscribe(([{ status, payload }, isMounted], unsubscribe) => {
        if (!isMounted) {
          unsubscribe();
          clean();
          return;
        }

        if (status == RETRY_ASYNC_STATUSES.READY) {
          setMoments(payload);
        }
      });
  }, []);

  const isShown = !!moments;
  const moments_ = moments || times(10);

  return (
    <div className="moments">
      {moments_.map((moment, i) => (
        <Moment key={i} i={i} data={moment} isShown={isShown} />
      ))}
    </div>
  );
}
