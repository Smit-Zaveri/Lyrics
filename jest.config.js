module.exports = {
  preset: 'react-native',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  setupFiles: ['<rootDir>/jest.setup.js'],
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
  // Include additional packages that ship ESM code:
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|react-native-gesture-handler|react-native-vector-icons|react-native-elements|@react-native-community/netinfo|@react-navigation|@firebase|firebase|react-native-size-matters|react-native-image-picker|react-native-ratings|react-native-dynamic-search-bar|react-native-dropdown-picker|react-native-modal|react-native-paper|react-native-share|react-native-sound|react-native-tts|@react-native-async-storage|@react-native-picker|@rneui|react-native-fs|react-native-sound-player|react-native-image-zoom-viewer|react-native-material-menu|@react-native-documents|@react-native-community|transliteration|fuse.js)/)'
  ],
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/__mocks__/fileMock.js',
  },
};
