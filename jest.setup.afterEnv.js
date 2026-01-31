// Setup file that runs after the test environment is set up
// This is the right place for mocks that need to override module behavior

// Mock SingerModeContext
jest.mock('./src/context/SingerModeContext', () => ({
  useSingerMode: jest.fn(() => ({
    isSingerMode: false,
    toggleSingerMode: jest.fn(),
    enableSingerMode: jest.fn(),
    disableSingerMode: jest.fn(),
  })),
  SingerModeProvider: ({children}) => children,
}));

// Mock FontSizeContext
jest.mock('./src/context/FontSizeContext', () => ({
  useFontSize: jest.fn(() => ({
    fontSize: 'medium',
    changeFontSize: jest.fn(),
    fontSizeValue: 16,
  })),
  FontSizeContext: {
    _currentValue: {
      fontSize: 'medium',
      changeFontSize: jest.fn(),
      fontSizeValue: 16,
    },
  },
  FontSizeProvider: ({children}) => children,
}));

// Mock Firebase properly
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(() => ({})),
  getApps: jest.fn(() => []),
  getApp: jest.fn(() => ({})),
}));

jest.mock('firebase/firestore', () => ({
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
  serverTimestamp: jest.fn(() => ({})),
  onSnapshot: jest.fn(),
  Timestamp: {now: jest.fn()},
}));

jest.mock('./src/firebase/config', () => ({
  db: {},
  default: {},
}));
