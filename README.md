# Lyrics Display Application

A dynamic, offline-first lyrics display application developed in React Native, featuring a sleek theme system, media integration, and robust content management. Designed with a focus on user experience, the application provides reliable access to lyrics even in areas with limited internet connectivity.

## Project Overview

This application is designed to provide access to song lyrics with special focus on Jain religious songs. The app (known as "Jain Dhun") features a modern, user-friendly interface with comprehensive lyrics management capabilities.

## Core Features

### Content Management

- Comprehensive lyrics display with multilingual support
- Dynamic content loading and caching
- Collections and favorites management
- Advanced search with highlighting
- Category-based organization (artists, tirthankar, tirth)
- Tag-based filtering system

### Media Features

- Integrated audio playback with progress tracking
- YouTube video integration
- Font size adjustment for better readability
- Share functionality

### User Experience

- Dark/Light theme support with system theme integration
- Responsive design for various device sizes
- Smooth animations and transitions
- Offline-first architecture
- Multi-language support (Gujarati, Hindi, English)

### Technical Highlights

- Firebase integration for backend services
- OneSignal for push notifications
- Comprehensive error handling
- Efficient AsyncStorage implementation
- Optimized performance for smooth interactions

## Getting Started

> **Note**: Make sure you have completed the [React Native - Environment Setup](https://reactnative.dev/docs/environment-setup) instructions till "Creating a new application" step, before proceeding.

### Step 1: Start the Metro Server

First, you will need to start **Metro**, the JavaScript _bundler_ that ships _with_ React Native.

To start Metro, run the following command from the _root_ of your React Native project:

```bash
# using npm
npm start

# OR using Yarn
yarn start
```

### Step 2: Start your Application

Let Metro Bundler run in its _own_ terminal. Open a _new_ terminal from the _root_ of your React Native project. Run the following command to start your _Android_ or _iOS_ app:

### For Android

```bash
# using npm
npm run android

# OR using Yarn
yarn android
```

### For iOS

```bash
# using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up _correctly_, you should see your new app running in your _Android Emulator_ or _iOS Simulator_ shortly provided you have set up your emulator/simulator correctly.

This is one way to run your app — you can also run it directly from within Android Studio and Xcode respectively.

## Project Structure

The project follows a modular architecture with these key components:

- **src/components**: Reusable UI components
- **src/screens**: Main application screens
- **src/context**: Context providers for themes, language, etc.
- **src/config**: Configuration and service files
- **src/theme**: Theme definitions and styling
- **src/assets**: Images, sounds, and other static resources

## Technical Implementation

### State Management

- React hooks (useState, useEffect, useCallback, useMemo)
- Context API for global state (themes, language)
- Efficient re-rendering control

### Storage and Data

- AsyncStorage for persistent data
- Firebase Firestore integration
- Offline data synchronization

### UI and Animation

- Custom animations using Animated API
- Gesture handling with PanResponder
- Material Design inspired components
- Vector icons integration

### Navigation

- React Navigation with custom configuration
- Stack and Tab navigators
- Dynamic headers and navigation options

## Contributing

Please see the [CONTRIBUTING.md](./CONTRIBUTING.md) file for guidelines on how to contribute to this project.

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## Troubleshooting

If you can't get this to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page in the React Native documentation.

## Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.
