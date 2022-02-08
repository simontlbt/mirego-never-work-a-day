import { useCallback, useState, useEffect } from "react";

export function State(init) {
  let state_ = init;

  let listeners = {};

  return function useHook() {
    const [state__, setState] = useState(state_);

    useEffect(() => {
      const index = Object.keys(listeners).length;
      const listener = (value) => {
        setState(value);
      };

      listeners[index] = listener;

      return () => {
        delete listeners[index];
      };
    }, []);

    const setState_ = useCallback((value) => {
      state_ = typeof value === "function" ? value(state_) : value;

      for (const listener of Object.values(listeners)) {
        listener(state_);
      }
    }, []);

    return [state__, setState_];
  };
}
