import { Observer } from "../utils/pubsub/observer";
import { State } from "./state";

export const useRouterState = State({ isTransitioning: true });

export const routerObserver = Observer({ isTransitioning: true });
