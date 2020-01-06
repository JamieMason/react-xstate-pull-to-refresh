import React from 'react';
import './LoadingStatus.css';
import { PullToRefreshSchema } from '../../machines/pull-to-refresh';

type Status = keyof PullToRefreshSchema['states']['loading']['states'];

interface AnimationStyles {
  animationDuration: string;
}

type AnimatingPath = React.FunctionComponent<{ style: AnimationStyles }>;

const getAnimationTimings = (
  msLoadingDuration: number,
  msStatusDisplay: number,
  status: Status,
): AnimationStyles => {
  return status === 'pending'
    ? { animationDuration: `${msLoadingDuration}ms` }
    : { animationDuration: `${msStatusDisplay}ms` };
};

const MaskingCircle = () => (
  <defs>
    <clipPath id="masking-circle">
      <circle r="35" cy="50" cx="50" />
    </clipPath>
  </defs>
);

const RadialProgress: AnimatingPath = ({ style }) => (
  <path
    className="progress"
    d="M50 21.646A28.354 28.354 0 0021.646 50 28.354 28.354 0 0050 78.354 28.354 28.354 0 0078.353 50 28.354 28.354 0 0050 21.646z"
    style={style}
  />
);

const VisibleCircle = () => (
  <circle className={`circle`} r="35" cy="50" cx="50" />
);

const DownArrow: AnimatingPath = ({ style }) => (
  <path className="arrow" d="M40 52l10 10 10-10M50 62l0-23" style={style} />
);

const Tick: AnimatingPath = ({ style }) => (
  <path
    className="tick"
    d="M49.533 13s-4.039.243-7.085 1.6C31.483 19.485 30.41 27.5 30.42 30.595c.026 7.553 4.608 12.169 6.13 13.957 4.87 5.72 10.899 11.939 10.899 11.939l15.873-13.58"
    style={style}
  />
);

const Cross: AnimatingPath = ({ style }) => (
  <polygon
    className="cross"
    points="49.99999809265137,47.514949798583984 37.57476997375488,35.089717864990234 35.0897159576416,37.57476806640625 47.51495552062988,50 35.0897159576416,62.42523193359375 37.57476997375488,64.91028594970703 49.99999809265137,52.485050201416016 62.42523765563965,64.91028594970703 64.9102840423584,62.42523193359375 52.48504829406738,50 64.9102840423584,37.57476806640625 62.42523765563965,35.089717864990234 49.99999809265137,47.514949798583984"
    style={style}
  />
);

export const LoadingStatus: React.FunctionComponent<{
  height: number;
  msLoadingDuration: number;
  msStatusDisplay: number;
  status: Status;
}> = ({ height, msLoadingDuration, msStatusDisplay, status }) => {
  const animationTimings = getAnimationTimings(
    msLoadingDuration,
    msStatusDisplay,
    status,
  );
  return (
    <svg
      className={`loading-status ${status}`}
      height={height}
      style={animationTimings}
      viewBox="9 9 82 82"
      width={height}
    >
      <MaskingCircle />
      <RadialProgress style={animationTimings} />
      <g clipPath="url(#masking-circle)">
        <VisibleCircle />
        <DownArrow style={animationTimings} />
        <Tick style={animationTimings} />
        <Cross style={animationTimings} />
      </g>
    </svg>
  );
};
