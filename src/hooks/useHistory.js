import { useEffect, useState } from "react";

const callbacks = {};

function notifyHandlers(data) {
  for (const [_, value] of Object.entries(callbacks)) {
    value(data);
  }
}

((history) => {
  const pushState = history.pushState;
  window.onpopstate = function (event) {
    notifyHandlers({ state: event.state, url: window.location.pathname });
  };
  history.pushState = function (state, title, url) {
    notifyHandlers({ state, title, url });
    if (typeof history.onpushstate == "function") {
      history.onpushstate({ state, title, url });
    }
    return pushState.apply(history, arguments);
  };
})(window.history);

export function pushState({ state, title, url }) {
  window.history.pushState(state, title, url);
}

export function useHistory() {
  const [state, setState] = useState({ url: window.location.pathname });

  useEffect(() => {
    const callback = (data) => {
      setState(data);
    };

    const index = Object.keys(callbacks).length;

    callbacks[index] = callback;

    return () => {
      delete callbacks[index];
    };
  }, []);

  return state;
}
