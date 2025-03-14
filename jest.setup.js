// Mock modules
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');
jest.mock("react-native-vector-icons/MaterialCommunityIcons", () => "MaterialCommunityIcons");
jest.mock("react-native-vector-icons/MaterialIcons", () => "MaterialIcons");

jest.mock("@react-native-community/netinfo", () => ({
    addEventListener: jest.fn(),
    fetch: jest.fn(() => Promise.resolve({ isConnected: true })),
  }));
  
// In jest.setup.js
jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual('@react-navigation/native');
    return {
      ...actualNav,
      createNavigatorFactory: () => () => null,
    };
  });
  
// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock react-native-sound
jest.mock('react-native-sound', () => {
  return jest.fn().mockImplementation(() => ({
    play: jest.fn(),
    stop: jest.fn(),
    pause: jest.fn(),
    release: jest.fn(),
  }));
});

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => {
  const View = require('react-native/Libraries/Components/View/View');
  return {
    Swipeable: View,
    DrawerLayout: View,
    State: {},
    ScrollView: View,
    Slider: View,
    Switch: View,
    TextInput: View,
    ToolbarAndroid: View,
    ViewPagerAndroid: View,
    DrawerLayoutAndroid: View,
    WebView: View,
    NativeViewGestureHandler: View,
    TapGestureHandler: View,
    FlingGestureHandler: View,
    ForceTouchGestureHandler: View,
    LongPressGestureHandler: View,
    PanGestureHandler: View,
    PinchGestureHandler: View,
    RotationGestureHandler: View,
    /* Buttons */
    RawButton: View,
    BaseButton: View,
    RectButton: View,
    BorderlessButton: View,
    /* Other */
    FlatList: View,
    gestureHandlerRootHOC: jest.fn(),
    Directions: {},
  };
});

// Mock react-navigation
jest.mock('@react-navigation/native', () => {
  return {
    ...jest.requireActual('@react-navigation/native'),
    useNavigation: () => ({
      navigate: jest.fn(),
      setOptions: jest.fn(),
    }),
  };
});