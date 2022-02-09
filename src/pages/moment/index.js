import { useCallback, useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";
import { useObserveIsMounted } from "../../hooks/useIsMounted";
import { specificMomentState } from "../../state/moment";
import { clsx } from "../../utils/classnames";
import { RETRY_ASYNC_STATUSES } from "../../utils/pubsub/domain";
import { combine } from "../../utils/pubsub/operators";
import { Comments } from "./components/comments";
import "./index.scss";

export function Moment(data) {
  const id = data.match[1];

  const isMountedObserver = useObserveIsMounted();

  const [isMainHover, setIsMainHover] = useState(false);
  const [moment, setMoment] = useState(undefined);

  useEffect(() => {
    const { observer, clean } = specificMomentState(id);

    observer
      .pipe(combine(isMountedObserver))
      .subscribe(([{ status, payload }, isMounted], unsubscribe) => {
        if (!isMounted) {
          unsubscribe();
          clean();
          return;
        }

        if (status == RETRY_ASYNC_STATUSES.READY) {
          setMoment(payload);
        }
      });
  }, []);

  const handleMainClick = useCallback(() => {
    setIsMainHover((prev) => !prev);
  }, []);

  const isShown = !!moment;

  return (
    <div className="moment">
      <div
        onClick={handleMainClick}
        className={clsx("moment__picture", {
          "moment__picture--shrunk": !isMainHover,
        })}
        style={{ paddingTop: `100%` }}
      >
        <div
          className="moment__picture__inner"
          style={{ backgroundImage: isShown && `url(${moment.media.xlarge})` }}
        >
          {!isShown && <Skeleton height="100%" />}
          {isShown && (
            <div className="moment__picture__btn">
              {isMainHover ? "Appuyer pour reduire" : "Appuyer pour agrandir"}
            </div>
          )}
        </div>
      </div>
      <div className="moment__content">
        <div className="moment__header">
          <div className="moment__title">
            {isShown ? moment.description : <Skeleton count={2} />}
          </div>
          <div
            className="moment__author"
            style={{
              backgroundImage: isShown && `url(${moment.user.avatar.large})`,
            }}
          >
            {!isShown && <Skeleton height="100%" />}
          </div>
        </div>
      </div>
      <Comments comments={moment?.comments} />
    </div>
  );
}
