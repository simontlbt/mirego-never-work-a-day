import { useIsMounted } from "../hooks/useIsMounted";
import { getMoment } from "../utils/requests";
import { State } from "./state";

const useMoment_ = State({});

export function useMoment() {
  const [moment, setMoment] = useMoment_();

  const isMounted = useIsMounted();

  const init = async (id) => {
    if (moment[id]) {
      return;
    }

    const moment_ = await getMoment(id);

    if (!isMounted()) {
      return;
    }

    setMoment((prev) => ({ ...prev, [id]: moment_ }));
  };

  return [moment, { init }];
}
