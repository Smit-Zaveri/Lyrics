import React, {useState, useEffect} from 'react';
import {Text, View} from 'react-native';
import SplashScreen from './componet/common/SplashScreen';

const App = () => {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1300);

    return () => clearTimeout(timer);
  }, []);
  return (
    <>
      {showSplash ? (
        <SplashScreen/>
      ) : (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Text>Hello, world!</Text>
        </View>
      )}
    </>
  );
};
export default App;
