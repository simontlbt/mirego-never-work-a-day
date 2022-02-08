import { useCallback, useEffect, useRef, useState } from "react";
import Skeleton from "react-loading-skeleton";
import { useIsMounted } from "../hooks/useIsMounted";
import { useMoment } from "../state/moment";
import { useRouterState } from "../state/router";
import { clsx } from "../utils/classnames";
import { fetchImage } from "../utils/images";
import { wait } from "../utils/wait";
import "./moment.scss";
import { ReactComponent as CaretDown } from "../assets/icons/caret-down.svg";

function Comment({ comment }) {
  return (
    <div className="moment__comments__item">
      <div
        className="moment__comments__item__avatar"
        style={{ backgroundImage: `url(${comment.user.avatar.large})` }}
      ></div>
      <div className="moment__comments__item__content">
        <div className="moment__comments__item__header">
          {comment.user.full_name}&nbsp;&nbsp;
          <span>{new Date(comment.created_at).toLocaleString()}</span>
        </div>
        <div className="moment__comments__item__message">{comment.comment}</div>
      </div>
    </div>
  );
}

export function Moment(data) {
  const id = data.match[1];

  const isPreinit = !!data.history.state?.preInit;

  const [moment, { init }] = useMoment();

  const [{ isTransitioning }] = useRouterState();

  const isMounted = useIsMounted();

  const isLoading = useRef(false);
  const [isShown, setIsShown] = useState(false);
  const [image, setImage] = useState(null);
  const [ratio, setRatio] = useState(null);
  const [isMainHover, setIsMainHover] = useState(false);
  const commentsInnerRef = useRef(null);
  const commentsRef = useRef(null);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [isTransitioningComments, setIsTransitioningComments] = useState(false);
  const [commentsHeight, setCommentsHeight] = useState("0px");

  useEffect(async () => {
    if (!moment[id]) {
      if (isPreinit) {
        isLoading.current = true;
      }

      if (isLoading.current) {
        return;
      }
      isLoading.current = true;
      init(id);
    } else {
      const mainPicture = await fetchImage(moment[id].media.xlarge);

      if (!isMounted()) {
        return;
      }

      setImage(mainPicture);
    }
  }, [moment]);

  useEffect(async () => {
    if (image) {
      if (!isTransitioning && isLoading.current) {
        await wait(1000);
      }

      if (!isMounted()) {
        return;
      }

      setRatio(image.height / image.width);

      setIsShown(true);
    }
  }, [image, isTransitioning]);

  const handleMainClick = useCallback(() => {
    setIsMainHover((prev) => !prev);
  }, []);

  const handleCommentsClick = async () => {
    if (isTransitioningComments) {
      return;
    }

    setIsTransitioningComments(true);
    setCommentsOpen(!commentsOpen);

    if (commentsOpen) {
      setCommentsHeight(commentsInnerRef.current.scrollHeight);
    } else {
      setCommentsHeight("0px");
    }

    await wait(0);

    if (!isMounted()) {
      return;
    }

    if (commentsOpen) {
      setCommentsHeight("0px");
    } else {
      setCommentsHeight(commentsInnerRef.current.scrollHeight);
    }

    await wait(600);

    if (!isMounted()) {
      return;
    }

    if (!commentsOpen) {
      setCommentsHeight("none");
    }

    setIsTransitioningComments(false);
  };

  const moment_ = moment[id];

  return (
    <div className="moment">
      <div
        onClick={handleMainClick}
        className={clsx("moment__picture", {
          "moment__picture--shrunk": !isMainHover,
        })}
        style={{ paddingTop: `${(ratio * 100).toFixed(2)}%` }}
      >
        <div
          className="moment__picture__inner"
          style={{ backgroundImage: isShown && `url(${moment_.media.xlarge})` }}
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
            {isShown ? moment_.description : <Skeleton count={2} />}
          </div>
          <div
            className="moment__author"
            style={{
              backgroundImage: isShown && `url(${moment_.user.avatar.large})`,
            }}
          >
            {!isShown && <Skeleton height="100%" />}
          </div>
        </div>
      </div>
      <div
        className={clsx("moment__comments", {
          "moment__comments--open": commentsOpen,
        })}
        onClick={handleCommentsClick}
      >
        <div className="moment__comments__header">
          <div className="moment__comments__title">
            {isShown ? (
              `${moment_.comments_count} commentaires`
            ) : (
              <Skeleton width="50%" />
            )}
          </div>
          {isShown && (
            <>
              <div className="moment__comments__icon">
                <CaretDown />
              </div>
              <div className=" moment__comments__icon moment__comments__icon--opposite">
                <CaretDown />
              </div>
            </>
          )}
        </div>
        {isShown && (
          <div
            ref={commentsRef}
            className="moment__comments__items"
            style={{
              maxHeight: commentsHeight,
            }}
          >
            <div
              ref={commentsInnerRef}
              className="moment__comments__items__inner"
            >
              {moment_.comments.map((comment) => (
                <Comment comment={comment} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
