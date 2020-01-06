import { PullToRefresh } from '../index';

export const addTouchSupport = (component: PullToRefresh) => {
  const isSingleTouch = (touchEvent: TouchEvent) => {
    return touchEvent.touches.length === 1;
  };

  const getTouchDistanceFromTop = (touchEvent: TouchEvent) => {
    return component.scrollArea.current !== null
      ? touchEvent.touches[0].clientY -
          component.scrollArea.current.getBoundingClientRect().top
      : 0;
  };

  component.onTouchStart = ({ nativeEvent }) => {
    if (isSingleTouch(nativeEvent)) {
      component.service.send('TOUCH_START', {
        startingDistance: getTouchDistanceFromTop(nativeEvent),
      });
    }
  };

  component.onTouchMove = ({ nativeEvent }) => {
    if (isSingleTouch(nativeEvent)) {
      component.service.send('TOUCH_MOVE', {
        distance: getTouchDistanceFromTop(nativeEvent),
      });
    }
  };

  component.onTouchEnd = () => {
    component.service.send('TOUCH_END');
  };
};
