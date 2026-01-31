// Mock react-native FIRST - before any other imports or mocks
jest.mock('react-native', () => {
  const RN = {
    // Core components
    View: 'View',
    Text: 'Text',
    TextInput: 'TextInput',
    TouchableOpacity: 'TouchableOpacity',
    TouchableHighlight: 'TouchableHighlight',
    TouchableWithoutFeedback: 'TouchableWithoutFeedback',
    ScrollView: 'ScrollView',
    FlatList: 'FlatList',
    SectionList: 'SectionList',
    Image: 'Image',
    ActivityIndicator: 'ActivityIndicator',
    Modal: 'Modal',
    SafeAreaView: 'SafeAreaView',
    StatusBar: 'StatusBar',
    Switch: 'Switch',
    Button: 'Button',
    RefreshControl: 'RefreshControl',
    KeyboardAvoidingView: 'KeyboardAvoidingView',
    Pressable: 'Pressable',

    // APIs
    Dimensions: {
      get: jest.fn(() => ({width: 375, height: 667, scale: 2, fontScale: 1})),
      set: jest.fn(),
      addEventListener: jest.fn(() => ({remove: jest.fn()})),
      removeEventListener: jest.fn(),
    },

    Platform: {
      OS: 'ios',
      Version: '13.0',
      select: jest.fn(obj => obj.ios || obj.default),
      isPad: false,
      isTV: false,
      isTesting: true,
      constants: {
        forceTouchAvailable: false,
        interfaceIdiom: 'phone',
        osVersion: '13.0',
        systemName: 'iOS',
        isTesting: true,
      },
    },

    PixelRatio: {
      get: jest.fn(() => 2),
      getFontScale: jest.fn(() => 1),
      getPixelSizeForLayoutSize: jest.fn(size => size * 2),
      roundToNearestPixel: jest.fn(size => size),
    },

    StyleSheet: {
      create: jest.fn(styles => styles),
      flatten: jest.fn(style => {
        if (Array.isArray(style)) {
          return Object.assign({}, ...style.filter(s => s));
        }
        return style || {};
      }),
      hairlineWidth: 1,
      absoluteFill: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
      },
      absoluteFillObject: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
      },
    },

    UIManager: {
      setLayoutAnimationEnabledExperimental: jest.fn(),
    },

    NativeModules: {
      RNDeviceInfo: {
        getConstants: jest.fn(() => ({
          Dimensions: {
            window: {width: 375, height: 667, scale: 2, fontScale: 1},
            screen: {width: 375, height: 667, scale: 2, fontScale: 1},
          },
        })),
      },
    },

    TurboModuleRegistry: {
      get: jest.fn(() => ({})),
      getEnforcing: jest.fn(() => ({})),
    },

    // Other exports
    Alert: {
      alert: jest.fn(),
    },
    Animated: {
      View: 'Animated.View',
      Text: 'Animated.Text',
      ScrollView: 'Animated.ScrollView',
      FlatList: 'Animated.FlatList',
      SectionList: 'Animated.SectionList',
      Image: 'Animated.Image',
      createAnimatedComponent: jest.fn(component => component),
      timing: jest.fn(() => ({start: jest.fn()})),
      spring: jest.fn(() => ({start: jest.fn()})),
      decay: jest.fn(() => ({start: jest.fn()})),
      sequence: jest.fn(() => ({start: jest.fn()})),
      parallel: jest.fn(() => ({start: jest.fn()})),
      loop: jest.fn(() => ({start: jest.fn()})),
      stagger: jest.fn(() => ({start: jest.fn()})),
      delay: jest.fn(() => ({start: jest.fn()})),
      event: jest.fn(),
      Value: jest.fn(val => ({
        setValue: jest.fn(),
        _value: val,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        interpolate: jest.fn(),
      })),
      ValueXY: jest.fn(() => ({
        setValue: jest.fn(),
        addListener: jest.fn(),
        removeListener: jest.fn(),
      })),
      interpolate: jest.fn(),
      multiply: jest.fn(),
      divide: jest.fn(),
      modulo: jest.fn(),
    },

    // Easing is a separate top-level export in React Native, not part of Animated
    Easing: {
      linear: jest.fn(() => jest.fn()),
      ease: jest.fn(() => jest.fn()),
      quad: jest.fn(() => jest.fn()),
      cubic: jest.fn(() => jest.fn()),
      poly: jest.fn(() => jest.fn()),
      sin: jest.fn(() => jest.fn()),
      circle: jest.fn(() => jest.fn()),
      exp: jest.fn(() => jest.fn()),
      elastic: jest.fn(() => jest.fn()),
      back: jest.fn(() => jest.fn()),
      bounce: jest.fn(() => jest.fn()),
      bezier: jest.fn(() => jest.fn()),
      in: jest.fn(() => jest.fn()),
      out: jest.fn(() => jest.fn()),
      inOut: jest.fn(() => jest.fn()),
    },

    AppRegistry: {
      registerComponent: jest.fn(),
      registerRunnable: jest.fn(),
      getRunnable: jest.fn(),
    },

    BackHandler: {
      addEventListener: jest.fn(() => ({remove: jest.fn()})),
      removeEventListener: jest.fn(),
      exitApp: jest.fn(),
    },

    Linking: {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      openURL: jest.fn(() => Promise.resolve()),
      canOpenURL: jest.fn(() => Promise.resolve(true)),
      getInitialURL: jest.fn(() => Promise.resolve()),
    },

    NativeEventEmitter: jest.fn(() => ({
      addListener: jest.fn(),
      removeListener: jest.fn(),
      removeAllListeners: jest.fn(),
    })),

    Share: {
      share: jest.fn(() => Promise.resolve({action: 'sharedAction'})),
    },

    Keyboard: {
      addListener: jest.fn(() => ({remove: jest.fn()})),
      removeListener: jest.fn(),
      dismiss: jest.fn(),
    },

    LayoutAnimation: {
      configureNext: jest.fn(),
      Types: {},
      Properties: {},
      Presets: {},
    },

    useWindowDimensions: jest.fn(() => ({
      width: 375,
      height: 667,
      scale: 2,
      fontScale: 1,
    })),
  };

  return RN;
});

// Mock react-native-safe-area-context (required by react-native-paper)
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  const {View} = require('react-native');

  return {
    SafeAreaProvider: ({children}) => React.createElement(View, null, children),
    SafeAreaView: ({children}) => React.createElement(View, null, children),
    useSafeAreaInsets: jest.fn(() => ({top: 0, right: 0, bottom: 0, left: 0})),
    useSafeAreaFrame: jest.fn(() => ({x: 0, y: 0, width: 375, height: 667})),
  };
});

// Mock react-native-paper
jest.mock('react-native-paper', () => {
  const React = require('react');
  const {View, Text, TextInput, TouchableOpacity} = require('react-native');

  const MockComponent =
    name =>
    ({children, ...props}) =>
      React.createElement(View, {testID: `paper-${name}`, ...props}, children);

  return {
    Provider: MockComponent('Provider'),
    Portal: MockComponent('Portal'),
    Searchbar: ({onChangeText, ...props}) =>
      React.createElement(TextInput, {
        testID: 'paper-Searchbar',
        onChangeText,
        ...props,
      }),
    List: {
      Section: MockComponent('List.Section'),
      Item: MockComponent('List.Item'),
    },
    Chip: MockComponent('Chip'),
    Card: MockComponent('Card'),
    Title: MockComponent('Title'),
    Paragraph: MockComponent('Paragraph'),
    Button: ({children, onPress, ...props}) =>
      React.createElement(
        TouchableOpacity,
        {
          testID: 'paper-Button',
          onPress,
          ...props,
        },
        children,
      ),
    IconButton: MockComponent('IconButton'),
    FAB: MockComponent('FAB'),
    Snackbar: MockComponent('Snackbar'),
    Dialog: {
      ...MockComponent('Dialog'),
      Title: MockComponent('Dialog.Title'),
      Content: MockComponent('Dialog.Content'),
      Actions: MockComponent('Dialog.Actions'),
    },
    Menu: MockComponent('Menu'),
    Divider: MockComponent('Divider'),
    useTheme: jest.fn(() => ({
      colors: {
        primary: '#6200ee',
        accent: '#03dac4',
        background: '#f6f6f6',
        surface: '#ffffff',
        text: '#000000',
        disabled: '#9e9e9e',
        placeholder: '#9e9e9e',
        backdrop: 'rgba(0,0,0,0.5)',
      },
    })),
  };
});

// Mock react-native-elements
jest.mock('react-native-elements', () => {
  const React = require('react');
  const {View, Text, TouchableOpacity} = require('react-native');

  const MockComponent =
    name =>
    ({children, ...props}) =>
      React.createElement(View, {testID: `rne-${name}`, ...props}, children);

  return {
    Card: MockComponent('Card'),
    Button: ({title, onPress, ...props}) =>
      React.createElement(
        TouchableOpacity,
        {
          testID: 'rne-Button',
          onPress,
          ...props,
        },
        React.createElement(Text, null, title),
      ),
    Icon: MockComponent('Icon'),
    Input: MockComponent('Input'),
    Text: MockComponent('Text'),
    Avatar: MockComponent('Avatar'),
    ListItem: MockComponent('ListItem'),
    Divider: MockComponent('Divider'),
    ThemeProvider: ({children}) => children,
  };
});

// Mock react-native-size-matters (used by react-native-elements)
jest.mock('react-native-size-matters', () => ({
  scale: jest.fn(size => size),
  verticalScale: jest.fn(size => size),
  moderateScale: jest.fn((size, factor = 0.5) => size + (size - size) * factor),
  s: jest.fn(size => size),
  vs: jest.fn(size => size),
  ms: jest.fn((size, factor = 0.5) => size + (size - size) * factor),
}));

// Mock Firebase
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(),
  getApps: jest.fn(() => []),
  getApp: jest.fn(),
}));

jest.mock('firebase/firestore', () => {
  const mockDb = {
    _databaseId: {projectId: 'test-project'},
    _settings: {},
  };
  return {
    getFirestore: jest.fn(app => mockDb),
    collection: jest.fn(() => ({})),
    doc: jest.fn(() => ({})),
    getDocs: jest.fn(() => Promise.resolve({docs: []})),
    getDoc: jest.fn(() => Promise.resolve({exists: false, data: () => null})),
    setDoc: jest.fn(() => Promise.resolve()),
    updateDoc: jest.fn(() => Promise.resolve()),
    deleteDoc: jest.fn(() => Promise.resolve()),
    addDoc: jest.fn(() => Promise.resolve({id: 'test-id'})),
    query: jest.fn(() => ({})),
    where: jest.fn(() => ({})),
    orderBy: jest.fn(() => ({})),
    limit: jest.fn(() => ({})),
    serverTimestamp: jest.fn(() => ({seconds: Date.now() / 1000})),
  };
});

jest.mock('@firebase/firestore', () => ({
  getFirestore: jest.fn(() => ({})),
  collection: jest.fn(),
  doc: jest.fn(),
  getDocs: jest.fn(),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  addDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  serverTimestamp: jest.fn(() => ({seconds: Date.now() / 1000})),
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({})),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn(),
}));

// Mock incompatible libraries
jest.mock('@react-native-documents/picker', () => ({
  pick: jest.fn(() => Promise.resolve([])),
  PickOptions: {},
}));

jest.mock('react-native-fs', () => ({}));

jest.mock('@react-navigation/material-bottom-tabs', () => {
  const React = require('react');
  const {View} = require('react-native');
  return {
    createMaterialBottomTabNavigator: jest.fn(() => ({
      Navigator: ({children}) => React.createElement(View, null, children),
      Screen: ({children}) => React.createElement(View, null, children),
    })),
  };
});

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => {
  const React = require('react');
  const {Text} = require('react-native');
  return props => React.createElement(Text, props);
});

jest.mock('react-native-vector-icons/MaterialIcons', () => {
  const React = require('react');
  const {Text} = require('react-native');
  return props => React.createElement(Text, props);
});

// Mock netinfo
jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(),
  fetch: jest.fn(() => Promise.resolve({isConnected: true})),
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// Mock react-native-sound
jest.mock('react-native-sound', () => {
  return jest.fn().mockImplementation(() => ({
    play: jest.fn(),
    pause: jest.fn(),
    stop: jest.fn(),
    release: jest.fn(),
  }));
});

// Mock react-native-sound-player
jest.mock('react-native-sound-player', () => ({
  playSoundFile: jest.fn(),
  stop: jest.fn(),
  pause: jest.fn(),
  resume: jest.fn(),
  getInfo: jest.fn(() => Promise.resolve({duration: 0, currentTime: 0})),
  onFinishedPlaying: jest.fn(),
  onFinishedLoading: jest.fn(),
}));

// Mock react-native-tts
jest.mock('react-native-tts', () => ({
  speak: jest.fn(),
  stop: jest.fn(),
  pause: jest.fn(),
  setDefaultLanguage: jest.fn(),
  setDefaultRate: jest.fn(),
  setDefaultPitch: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
}));

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => {
  const React = require('react');
  const {View} = require('react-native');
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
    RawButton: View,
    BaseButton: View,
    RectButton: View,
    BorderlessButton: View,
    FlatList: View,
    gestureHandlerRootHOC: jest.fn(),
    Directions: {},
  };
});

// Mock react-navigation
jest.mock('@react-navigation/native', () => {
  const React = require('react');
  const {View} = require('react-native');
  return {
    useNavigation: () => ({
      navigate: jest.fn(),
      setOptions: jest.fn(),
      goBack: jest.fn(),
    }),
    useRoute: () => ({params: {}}),
    useFocusEffect: jest.fn(),
    NavigationContainer: ({children}) =>
      React.createElement(View, null, children),
  };
});

jest.mock('@react-navigation/native-stack', () => {
  const React = require('react');
  const {View} = require('react-native');
  return {
    createNativeStackNavigator: jest.fn(() => ({
      Navigator: ({children}) => React.createElement(View, null, children),
      Screen: ({children}) => React.createElement(View, null, children),
    })),
  };
});

// Mock react-native-share
jest.mock('react-native-share', () => ({
  default: jest.fn(() => Promise.resolve(true)),
  Social: {},
}));

// Mock react-native-image-picker
jest.mock('react-native-image-picker', () => ({
  launchImageLibrary: jest.fn(() => Promise.resolve({didCancel: true})),
  launchCamera: jest.fn(() => Promise.resolve({didCancel: true})),
}));

// Mock react-native-modal
jest.mock('react-native-modal', () => {
  const React = require('react');
  const {View} = require('react-native');
  return ({children, isVisible}) =>
    isVisible ? React.createElement(View, null, children) : null;
});

// Mock react-native-onesignal
jest.mock('react-native-onesignal', () => ({
  setAppId: jest.fn(),
  promptForPushNotificationsWithUserResponse: jest.fn(),
  setNotificationOpenedHandler: jest.fn(),
  setNotificationWillShowInForegroundHandler: jest.fn(),
}));

// Mock @react-native-picker/picker
jest.mock('@react-native-picker/picker', () => {
  const React = require('react');
  const {View} = require('react-native');
  return {
    Picker: ({children}) => React.createElement(View, null, children),
    Item: ({children}) => React.createElement(View, null, children),
  };
});

// Mock @react-native-community/slider
jest.mock('@react-native-community/slider', () => {
  const React = require('react');
  const {View} = require('react-native');
  return props => React.createElement(View, {testID: 'Slider', ...props});
});

// Mock @react-native-community/blur
jest.mock('@react-native-community/blur', () => {
  const React = require('react');
  const {View} = require('react-native');
  return {
    BlurView: props => React.createElement(View, props),
  };
});

// Mock react-native-material-menu
jest.mock('react-native-material-menu', () => {
  const React = require('react');
  const {View} = require('react-native');
  return {
    Menu: ({children}) => React.createElement(View, null, children),
    MenuItem: ({children}) => React.createElement(View, null, children),
    MenuDivider: () => React.createElement(View, null),
  };
});

// Mock react-native-image-zoom-viewer
jest.mock('react-native-image-zoom-viewer', () => {
  const React = require('react');
  const {View} = require('react-native');
  return props => React.createElement(View, props);
});

// Mock react-native-dynamic-search-bar
jest.mock('react-native-dynamic-search-bar', () => {
  const React = require('react');
  const {View} = require('react-native');
  return props => React.createElement(View, props);
});

// Mock react-native-dropdown-picker
jest.mock('react-native-dropdown-picker', () => {
  const React = require('react');
  const {View} = require('react-native');
  return props => React.createElement(View, props);
});

// Mock fuse.js
jest.mock('fuse.js', () => {
  return jest.fn().mockImplementation(() => ({
    search: jest.fn(() => []),
  }));
});

// Mock @react-native-firebase
jest.mock('@react-native-firebase/app', () => ({
  __esModule: true,
  default: jest.fn(() => ({})),
}));

jest.mock('@react-native-firebase/auth', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    signInAnonymously: jest.fn(() =>
      Promise.resolve({user: {uid: 'test-uid'}}),
    ),
    signInWithEmailAndPassword: jest.fn(),
    createUserWithEmailAndPassword: jest.fn(),
    signOut: jest.fn(),
    onAuthStateChanged: jest.fn(),
    currentUser: {uid: 'test-uid'},
  })),
}));

jest.mock('@react-native-firebase/firestore', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        get: jest.fn(() => Promise.resolve({exists: false, data: () => null})),
        set: jest.fn(() => Promise.resolve()),
        update: jest.fn(() => Promise.resolve()),
        delete: jest.fn(() => Promise.resolve()),
      })),
      get: jest.fn(() => Promise.resolve({docs: []})),
      add: jest.fn(() => Promise.resolve({id: 'test-id'})),
    })),
  })),
}));

// Mock @rneui/themed
jest.mock('@rneui/themed', () => {
  const React = require('react');
  const {View, Text} = require('react-native');
  return {
    ThemeProvider: ({children}) => children,
    Button: ({children}) => React.createElement(View, null, children),
    Card: ({children}) => React.createElement(View, null, children),
    Text: ({children}) => React.createElement(Text, null, children),
    Icon: () => React.createElement(View, null),
    Input: () => React.createElement(View, null),
    ListItem: ({children}) => React.createElement(View, null, children),
    Avatar: () => React.createElement(View, null),
    Badge: () => React.createElement(View, null),
    Divider: () => React.createElement(View, null),
    Overlay: ({children}) => React.createElement(View, null, children),
  };
});

// Mock transliteration
jest.mock('transliteration', () => ({
  transliterate: jest.fn(text => text),
  slugify: jest.fn(text => text.toLowerCase().replace(/\s+/g, '-')),
}));

// Mock rimraf
jest.mock('rimraf', () => jest.fn(() => Promise.resolve()));

// Mock glob
jest.mock('glob', () => jest.fn(() => []));

// Mock FontSizeContext
jest.mock('./src/context/FontSizeContext', () => {
  const React = require('react');
  const mockContextValue = {
    fontSize: 18,
    changeFontSize: jest.fn(),
  };
  const FontSizeContext = React.createContext(mockContextValue);
  return {
    FontSizeContext,
    FontSizeProvider: ({children}) => children,
  };
});

// Mock SingerModeContext
jest.mock('./src/context/SingerModeContext', () => {
  const React = require('react');
  const mockContextValue = {
    isSingerMode: false,
    toggleSingerMode: jest.fn(),
  };
  const SingerModeContext = React.createContext(mockContextValue);
  return {
    SingerModeContext,
    SingerModeProvider: ({children}) => children,
    useSingerMode: jest.fn(() => mockContextValue),
  };
});
