import { AnyEventObject, assign, interpret, Machine } from 'xstate';

interface PullToRefreshContext {
  distance: number;
  error: Error | null;
  scrollTop: number;
  startingDistance: number;
  pxDistanceRequired: number;
}

export interface PullToRefreshSchema {
  states: {
    listening: {};
    touching: {
      states: {
        idle: {};
        pulling: {};
      };
    };
    loading: {
      states: {
        pending: {};
        resolved: {};
        rejected: {};
        restoring: {};
      };
    };
  };
}

interface TouchStartEvent {
  type: 'TOUCH_START';
  startingDistance: number;
}

interface TouchMoveEvent {
  type: 'TOUCH_MOVE';
  distance: number;
}

interface TouchEndEvent {
  type: 'TOUCH_END';
}

interface InvokeServiceDoneEvent {
  type: 'done.invoke.pullToRefresh';
  data: null;
}

interface InvokeServiceErrorEvent {
  type: 'error.platform.pullToRefresh';
  data: Error;
}

type PullToRefreshEvent =
  | TouchStartEvent
  | TouchMoveEvent
  | TouchEndEvent
  | InvokeServiceDoneEvent
  | InvokeServiceErrorEvent;

interface CreatePullToRefreshOptions {
  getScrollTop: () => number;
  msStatusDisplay: number;
  pxDistanceRequired: number;
  services: { doRefresh: () => Promise<void> };
}

const toWithinRange = (floor: number, ceiling: number, value: number) =>
  Math.min(ceiling, Math.max(floor, value));

export const createPullToRefreshMachine = ({
  getScrollTop,
  msStatusDisplay,
  pxDistanceRequired,
  services: { doRefresh },
}: CreatePullToRefreshOptions) =>
  Machine<PullToRefreshContext, PullToRefreshEvent>(
    {
      id: 'pullToRefresh',
      initial: 'listening',
      context: {
        distance: 0,
        error: null,
        pxDistanceRequired,
        scrollTop: 0,
        startingDistance: 0,
      },
      states: {
        listening: {
          id: 'listening',
          entry: ['resetContext'],
          on: {
            TOUCH_START: {
              actions: ['storeScrollTop', 'storeStartingDistance'],
              target: '#idle',
            },
          },
        },
        touching: {
          states: {
            idle: {
              id: 'idle',
              on: {
                TOUCH_MOVE: [
                  {
                    cond: 'isPullingDownFromTop',
                    target: 'pulling',
                  },
                  { target: '#listening' },
                ],
                TOUCH_END: '#listening',
              },
            },
            pulling: {
              on: {
                TOUCH_MOVE: {
                  target: 'pulling',
                  actions: ['storeDistance'],
                },
                TOUCH_END: [
                  { cond: 'hasPulledFarEnough', target: '#loading' },
                  { target: '#listening' },
                ],
              },
            },
          },
        },
        loading: {
          id: 'loading',
          initial: 'pending',
          states: {
            pending: {
              invoke: {
                id: 'doRefresh',
                src: 'doRefresh',
                onDone: {
                  target: 'resolved',
                  actions: ['onRefreshSuccess'],
                },
                onError: {
                  target: 'rejected',
                  actions: ['onRefreshFailure'],
                },
              },
            },
            resolved: {
              after: { [msStatusDisplay]: 'restoring' },
            },
            rejected: {
              after: { [msStatusDisplay]: 'restoring' },
            },
            restoring: {
              entry: ['resetContext'],
              after: {
                [msStatusDisplay]: '#listening',
              },
            },
          },
        },
      },
    },
    {
      actions: {
        resetContext: assign<PullToRefreshContext, AnyEventObject>({
          distance: 0,
          startingDistance: 0,
        }),
        onRefreshFailure: assign<PullToRefreshContext, InvokeServiceErrorEvent>(
          {
            error: (context, { data }) => data,
          },
        ),
        onRefreshSuccess: assign<PullToRefreshContext, InvokeServiceDoneEvent>({
          error: () => null,
        }),
        storeDistance: assign<PullToRefreshContext, TouchMoveEvent>({
          distance: ({ startingDistance, pxDistanceRequired }, { distance }) =>
            toWithinRange(0, pxDistanceRequired, distance - startingDistance),
        }),
        storeScrollTop: assign<PullToRefreshContext, TouchStartEvent>({
          scrollTop: () => getScrollTop(),
        }),
        storeStartingDistance: assign<PullToRefreshContext, TouchStartEvent>({
          startingDistance: (context, { startingDistance }) => startingDistance,
        }),
      },
      guards: {
        isPullingDownFromTop: (
          { startingDistance, scrollTop }: PullToRefreshContext,
          { distance }: TouchMoveEvent,
        ) => scrollTop === 0 && distance >= startingDistance,
        hasPulledFarEnough: ({
          distance,
          pxDistanceRequired,
        }: PullToRefreshContext) => distance >= pxDistanceRequired,
      },
      services: {
        doRefresh: () => doRefresh(),
      },
    },
  );

export const createPullToRefreshService = (
  machineOptions: CreatePullToRefreshOptions,
) => interpret(createPullToRefreshMachine(machineOptions));
