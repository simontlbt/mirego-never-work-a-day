import { None, Some } from "./dataStructures";

export function Lazy(callback) {
  let value = None();

  return {
    get: () => {
      if (!value.hasValue) {
        value = Some(callback());
      }

      return value.value;
    },
    reset: () => {
      value = None();
    },
  };
}
