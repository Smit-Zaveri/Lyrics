import React, { useMemo } from 'react';
import { PanResponder } from 'react-native';

const NavigationHandler = ({ onNavigate, children }) => {
  const panResponder = useMemo(
    () => 
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (evt, gestureState) =>
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy),
        onPanResponderRelease: (e, gestureState) => {
          if (gestureState.dx > 50) {
            onNavigate('prev');
          } else if (gestureState.dx < -50) {
            onNavigate('next');
          }
        },
      }),
    [onNavigate]
  );

  return React.cloneElement(children, {
    ...panResponder.panHandlers
  });
};

export default NavigationHandler;