import { PullToRefresh } from '../index';

export const addMouseSupport = (component: PullToRefresh) => {
  const isLeftMouseButton = (mouseEvent: MouseEvent) => {
    return mouseEvent.buttons === undefined
      ? mouseEvent.which === 1
      : mouseEvent.buttons === 1;
  };

  const getMouseDistanceFromTop = (mouseEvent: MouseEvent) => {
    return component.scrollArea.current !== null
      ? mouseEvent.clientY -
          component.scrollArea.current.getBoundingClientRect().top
      : 0;
  };

  component.onMouseDown = ({ nativeEvent }) => {
    if (isLeftMouseButton(nativeEvent)) {
      component.service.send('TOUCH_START', {
        startingDistance: getMouseDistanceFromTop(nativeEvent),
      });
    }
  };

  component.onMouseMove = ({ nativeEvent }) => {
    if (isLeftMouseButton(nativeEvent)) {
      component.service.send('TOUCH_MOVE', {
        distance: getMouseDistanceFromTop(nativeEvent),
      });
    }
  };

  component.onMouseUp = () => {
    component.service.send('TOUCH_END');
  };
};
