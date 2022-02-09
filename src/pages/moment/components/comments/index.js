import { useRef, useState } from "react";
import Skeleton from "react-loading-skeleton";
import { useIsMounted } from "../../../../hooks/useIsMounted";
import { clsx } from "../../../../utils/classnames";
import { wait } from "../../../../utils/timing";
import { ReactComponent as CaretDown } from "../../../../assets/icons/caret-down.svg";

import "./index.scss";

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

export function Comments({ comments }) {
  const isMounted = useIsMounted();

  const commentsInnerRef = useRef(null);
  const commentsRef = useRef(null);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [isTransitioningComments, setIsTransitioningComments] = useState(false);
  const [commentsHeight, setCommentsHeight] = useState("0px");

  const isShown = !!comments;

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

  return (
    <div
      className={clsx("moment__comments", {
        "moment__comments--open": commentsOpen,
      })}
      onClick={handleCommentsClick}
    >
      <div className="moment__comments__header">
        <div className="moment__comments__title">
          {isShown ? (
            `${comments.length} commentaires`
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
            {comments.map((comment, i) => (
              <Comment key={i} comment={comment} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
