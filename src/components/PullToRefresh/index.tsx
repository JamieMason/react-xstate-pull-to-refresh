import React, { MouseEventHandler, ReactNode, TouchEventHandler } from 'react';
import { createPullToRefreshService } from '../../machines/pull-to-refresh';
import { LoadingStatus } from '../LoadingStatus';
import { addMouseSupport } from './lib/mouse';
import { addTouchSupport } from './lib/touch';
import { UserSelectProperty } from 'csstype';

interface Props {
  children: ReactNode;
  doRefresh: () => Promise<void>;
  msExpectedRefreshDuration: number;
  msStatusDisplay: number;
  pxDistanceRequired: number;
}

interface State {
  value: any;
}

const noop = () => {};

export class PullToRefresh extends React.Component<Props, State> {
  public buffer: React.RefObject<HTMLDivElement>;
  public onMouseDown: MouseEventHandler<HTMLDivElement> = noop;
  public onMouseMove: MouseEventHandler<HTMLDivElement> = noop;
  public onMouseUp: MouseEventHandler<HTMLDivElement> = noop;
  public onTouchEnd: TouchEventHandler<HTMLDivElement> = noop;
  public onTouchMove: TouchEventHandler<HTMLDivElement> = noop;
  public onTouchStart: TouchEventHandler<HTMLDivElement> = noop;
  public scrollArea: React.RefObject<HTMLDivElement>;
  public service: ReturnType<typeof createPullToRefreshService>;

  constructor(props: Props) {
    super(props);
    const { doRefresh, msStatusDisplay, pxDistanceRequired } = props;
    this.buffer = React.createRef();
    this.scrollArea = React.createRef();
    this.service = createPullToRefreshService({
      getScrollTop: () => {
        return this.scrollArea.current ? this.scrollArea.current.scrollTop : 0;
      },
      msStatusDisplay,
      pxDistanceRequired,
      services: {
        doRefresh,
      },
    });
    addMouseSupport(this);
    addTouchSupport(this);
    this.service.start();
  }

  componentDidMount() {
    this.service.onTransition(state => {
      if (state.changed !== false) {
        const [stateName] = state.toStrings().slice(-1);
        console.log(stateName, state.context);
        this.setState(() => ({ value: state.value }));
      }
    });
  }

  componentWillUnmount() {
    this.service.stop();
  }

  render() {
    const { state } = this.service;
    const [stateName] = state.toStrings().slice(-1);
    const { context, matches } = state;
    const { distance, pxDistanceRequired } = context;
    const { children, msExpectedRefreshDuration, msStatusDisplay } = this.props;
    const paddingBelowLoader = 20;
    const bufferStyles = {
      // move content up/down in sync with the mouse/touch
      transform: `translateY(${distance}px)`,
      // animate content back into place after load has finished
      transition: matches({ loading: 'restoring' })
        ? `transform ${msStatusDisplay}ms`
        : '',
      // prevent text being selected as mouse/touch pulls over it
      userSelect: (matches({ touching: 'pulling' })
        ? 'none'
        : 'auto') as UserSelectProperty,
    };

    const currentStatePartial = (
      <div className="fixed top-0 right-0 p-2 mt-4 mr-4 rounded-lg bg-yellow-400 text-sm">
        {stateName}
      </div>
    );

    const bufferPartial = (
      <div className="absolute inset-0" ref={this.buffer} style={bufferStyles}>
        {children}
      </div>
    );

    if (matches('listening')) {
      return (
        <main
          className="relative flex-1 overflow-auto"
          onMouseDown={this.onMouseDown}
          onTouchStart={this.onTouchStart}
          ref={this.scrollArea}
        >
          {bufferPartial}
          {currentStatePartial}
        </main>
      );
    }
    if (matches('touching')) {
      return (
        <main
          className="relative flex-1 overflow-auto"
          onMouseMove={this.onMouseMove}
          onMouseUp={this.onMouseUp}
          onTouchEnd={this.onTouchEnd}
          onTouchMove={this.onTouchMove}
          ref={this.scrollArea}
        >
          {bufferPartial}
          {currentStatePartial}
        </main>
      );
    }
    if (matches('loading')) {
      return (
        <main className="relative flex-1 overflow-hidden" ref={this.scrollArea}>
          <div className="absolute inset-x-0 top-0 flex justify-center items-center text-center">
            <LoadingStatus
              height={pxDistanceRequired - paddingBelowLoader}
              msLoadingDuration={msExpectedRefreshDuration}
              msStatusDisplay={msStatusDisplay}
              status={this.state.value.loading}
            />
          </div>
          {bufferPartial}
          {currentStatePartial}
        </main>
      );
    }
    return null;
  }
}
