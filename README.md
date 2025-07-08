
<div align="center">

# LYRICS  
*Inspire Souls, Elevate Every Lyric Experience*

![last-commit](https://img.shields.io/github/last-commit/Smit-Zaveri/Lyrics?style=flat&logo=git&logoColor=white&color=0080ff)
![repo-top-language](https://img.shields.io/github/languages/top/Smit-Zaveri/Lyrics?style=flat&color=0080ff)
![repo-language-count](https://img.shields.io/github/languages/count/Smit-Zaveri/Lyrics?style=flat&color=0080ff)

*Built with the tools and technologies:*

![JSON](https://img.shields.io/badge/JSON-000000.svg?style=flat&logo=JSON&logoColor=white)
![Markdown](https://img.shields.io/badge/Markdown-000000.svg?style=flat&logo=Markdown&logoColor=white)
![npm](https://img.shields.io/badge/npm-CB3837.svg?style=flat&logo=npm&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-DD2C00.svg?style=flat&logo=Firebase&logoColor=white)
![Prettier](https://img.shields.io/badge/Prettier-F7B93E.svg?style=flat&logo=Prettier&logoColor=black)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E.svg?style=flat&logo=JavaScript&logoColor=black)
![Gradle](https://img.shields.io/badge/Gradle-02303A.svg?style=flat&logo=Gradle&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB.svg?style=flat&logo=React&logoColor=black)
![C++](https://img.shields.io/badge/C++-00599C.svg?style=flat&logo=C%2B%2B&logoColor=white)
![XML](https://img.shields.io/badge/XML-005FAD.svg?style=flat&logo=XML&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6.svg?style=flat&logo=TypeScript&logoColor=white)
![Google](https://img.shields.io/badge/Google-4285F4.svg?style=flat&logo=Google&logoColor=white)
![bat](https://img.shields.io/badge/bat-31369E.svg?style=flat&logo=bat&logoColor=white)
![Kotlin](https://img.shields.io/badge/Kotlin-7F52FF.svg?style=flat&logo=Kotlin&logoColor=white)
![Podman](https://img.shields.io/badge/Podman-892CA0.svg?style=flat&logo=Podman&logoColor=white)
![React Hook Form](https://img.shields.io/badge/React%20Hook%20Form-EC5990.svg?style=flat&logo=React-Hook-Form&logoColor=white)
![Jest](https://img.shields.io/badge/Jest-C21325.svg?style=flat&logo=Jest&logoColor=white)

</div>

---

# Lyrics Display Application

A dynamic, offline-first lyrics display application developed in React Native, featuring a sleek theme system, media integration, and robust content management. Designed with a focus on user experience, the application provides reliable access to lyrics even in areas with limited internet connectivity.

---

## Project Overview

Lyrics is a feature-rich application designed to provide access to song lyrics with a special focus on Jain religious songs. The app (known as "Jain Dhun") features a modern, user-friendly interface with comprehensive lyrics management capabilities.

---

## Core Features

### ✅ Content Management

- Multilingual lyrics display
- Dynamic loading with caching
- Favorite and collections tracking
- Smart search with highlighting
- Category views (artist, tirthankar, tirth)
- Tag-based filtering system

### 🎧 Media Features

- Audio playback with tracking
- YouTube video integration
- Adjustable font size
- Sharing support

### 🌗 User Experience

- Light/Dark theme with auto sync
- Responsive across devices
- Smooth animations and transitions
- Fully offline-capable
- Supports Gujarati, Hindi, and English

### 🔧 Technical Highlights

- Firebase for backend sync
- OneSignal push notifications
- Resilient error handling
- Optimized AsyncStorage usage
- Performance-tuned architecture

---

## Getting Started

> ⚠️ Ensure you have completed [React Native Environment Setup](https://reactnative.dev/docs/environment-setup) before proceeding.

### Step 1: Start the Metro Bundler

```bash
# with npm
npm start

# or with yarn
yarn start
````

### Step 2: Launch the App

Let Metro run in its own terminal. In a new terminal:

#### Android

```bash
npm run android
# or
yarn android
```

#### iOS

```bash
npm run ios
# or
yarn ios
```

---

## Project Structure

```txt
src/
  ├── components/     # Reusable UI components
  ├── screens/        # Main app screens
  ├── context/        # App-wide state (theme, language)
  ├── config/         # Config files and services
  ├── theme/          # Styles and color tokens
  └── assets/         # Images, sounds, fonts
```

---

## Technical Implementation

### State Management

* React Hooks (`useState`, `useEffect`, `useMemo`)
* Context API for global state
* Memoization to minimize re-renders

### Storage & Data

* Persistent data with `AsyncStorage`
* Firebase Firestore backend
* Offline-first sync strategy

### UI & Animation

* `Animated API` for custom effects
* `PanResponder` for gestures
* Material-inspired UI
* Vector icon support

### Navigation

* React Navigation (Stack + Tab)
* Dynamic headers and route configs

---

## Testing

Lyrics uses Jest for testing:

```bash
npm test
```

Or other test runners if needed:

```bash
bundle exec rspec
gradle test
```

---

## Contributing

Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## License

MIT — see [LICENSE](./LICENSE) for details.

## Troubleshooting

See [React Native Troubleshooting](https://reactnative.dev/docs/troubleshooting) if setup fails.

---

## Learn More

* 🌐 [React Native](https://reactnative.dev)
* 📘 [Environment Setup](https://reactnative.dev/docs/environment-setup)
* 🛠️ [React Native Basics](https://reactnative.dev/docs/getting-started)
* 🧠 [React Native Blog](https://reactnative.dev/blog)
* 🗂 [GitHub Repo](https://github.com/facebook/react-native)

---

[⬆ Return to Top](#lyrics-display-application)

