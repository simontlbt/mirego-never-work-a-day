import { useCallback, useState } from "react";

export function useRerender() {
  const [index, setIndex] = useState(0);

  const doRerender = useCallback(() => {
    setIndex((prev) => prev++);
  }, []);

  return doRerender;
}
