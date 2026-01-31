# Jain Dhun - Lyrics Display Application

## Overview
Jain Dhun is a React Native mobile application designed for offline-first access to Jain religious song lyrics. The app provides a modern, user-friendly interface with robust features for managing and interacting with lyrics content.

---

## Application Structure

### Main Tabs (Bottom Navigation)
1. **Home** - Browse collections of songs
2. **Category** - Browse by Tirth, Tirthankar, and Artists
3. **Profile** - Settings, collections, and app management

---

## Complete Feature List

### 1. Home Screen
- Display of all song collections with numbered listing
- Pull-to-refresh functionality
- Automatic data refresh when date changes
- Network status detection with offline fallback
- Loading indicators and error states
- Collection filtering based on Singer Mode

### 2. Category Screen
- **Tirth Section** - Browse songs by pilgrimage locations
- **24 Tirthankar Section** - Browse songs by Tirthankar
- **Artists Section** - Browse songs by composer/artist
- Grid display with "View All" option for each category
- Pull-to-refresh support
- Language-aware display names

### 3. Song List Screen
- Filterable list of songs within a collection
- Tag-based filtering with horizontal scrollable tags
- Numbered song display with title
- Search icon in header for quick search
- Return-to-position after viewing details
- Highlight animation for recently viewed item
- Singer Mode numeric tags (1-9) for performance tagging

### 4. Detail Page (Lyrics View)
- Full lyrics display with adjustable font size
- Artist/composer information display
- Swipe left/right navigation between songs
- Animated transitions between songs
- Header shows song number and title

#### Action Buttons (FABs):
- **Bookmark** - Save to user collections
- **YouTube** - Open linked YouTube video (if available)
- **Edit** - Edit user-added songs (Singer Mode only)
- **Delete** - Delete user-added songs (Singer Mode only)

#### Menu Options:
- **Copy Lyrics** - Copy to clipboard
- **Share Lyrics** - Share via system share sheet
- **Report** - Report issues with lyrics

### 5. Audio Player
- Play/pause toggle with visual feedback
- Progress slider with seek functionality
- Time display (current/total duration)
- Loading indicator during audio load
- Error handling for playback issues

### 6. Media Content Support
- Image gallery with fullscreen view
- Multiple image support per song
- YouTube video link integration
- Data URL image support
- Pinch-to-zoom in fullscreen

### 7. Search Functionality
- Real-time search across lyrics and titles
- Fuzzy search with "Did you mean?" suggestions
- Multi-language search (Gujarati, Hindi, English)
- Transliteration support (Latin to Indic scripts)
- Tag chip suggestions while typing
- Recent search persistence
- Focus animation on search bar

### 8. Collections (Bookmarks)
- Create custom collections
- Add/remove songs from collections
- Edit collection names
- Delete collections with confirmation
- View songs within each collection
- Duplicate name validation
- Animated list items

### 9. Settings
#### Appearance:
- **Theme Selection**: Light / Dark / System (auto)
- Smooth theme transition animations

#### Font Size:
- Adjustable lyrics font size (12-24)
- Plus/minus controls with current size display

#### Localization:
- **Language Selection**: Gujarati (ગુજરાતી) / Hindi (हिन्दी)
- First-launch language selection modal
- All content localized based on selection

#### Advanced:
- **Singer Mode Toggle** - Enable performer features

### 10. Singer Mode Features
- Add custom songs with:
  - Title
  - Lyrics content
  - Tag selection from existing tags
  - Multiple image attachments (camera/gallery/files)
- Edit existing user-added songs
- Delete user-added songs with confirmation
- Numeric tags (1-9) for performance categorization
- Related songs suggestions based on numeric tags
- "Added Songs" collection visibility

### 11. Suggestion/Feedback
- Submit song suggestions to Firebase
- Collection/category dropdown selection
- Title and content input fields
- Network connectivity check before submission
- Success/error feedback modals

### 12. Profile Screen Options
- **Settings** - App configuration
- **My Collections** - Manage saved collections
- **Suggestion** - Submit feedback
- **Refresh Data** - Manual data sync with loading state
- **Share App** - Share app download link
- **Version Display** - Current app version

### 13. Push Notifications
- OneSignal integration
- Notification permission request on launch
- Click handling for notification actions

### 14. Offline Capabilities
- Complete offline functionality after initial sync
- AsyncStorage caching for all data
- Automatic cache management
- Network status detection
- Graceful offline fallbacks
- Date-based cache refresh

### 15. Splash Screen
- Animated logo display
- Theme-aware logo (light/dark variants)
- Fade and scale animations
- Version number display

### 16. Error Handling
- No internet connection screen with retry
- Loading states throughout the app
- User-friendly error messages
- Graceful fallbacks for missing data
- Audio playback error handling

---

## Technical Implementation

### State Management
- React Context API for global state:
  - `ThemeContext` - Theme preference and colors
  - `LanguageContext` - Language selection and getString helper
  - `FontSizeContext` - Lyrics font size preference
  - `SingerModeContext` - Singer mode toggle state
- React hooks (useState, useEffect, useCallback, useMemo, useRef)
- Efficient memoization for performance

### Navigation
- React Navigation v6
- Material Bottom Tab Navigator
- Native Stack Navigator for screen stacks
- Dynamic header configuration
- Gesture-based navigation
- Return-to-position support

### Data Storage
- AsyncStorage for:
  - Theme preference
  - Language preference
  - Font size preference
  - Singer mode preference
  - Cached collections and lyrics
  - User collections
  - Last open date
- Firebase Firestore for:
  - Suggestions/feedback storage
  - Report submissions

### Animations
- React Native Animated API
- Spring animations for interactive feedback
- Timing animations for transitions
- PanResponder for gesture handling
- Interpolate for complex transforms
- Staggered list animations

### Media Handling
- react-native-sound for audio playback
- react-native-image-picker for camera/gallery
- @react-native-documents/picker for file selection
- react-native-fs for file system operations
- Linking API for YouTube/external URLs

### UI Components
- react-native-paper for Material components
- react-native-vector-icons (MaterialIcons, MaterialCommunityIcons)
- @react-native-community/slider for audio progress
- react-native-dropdown-picker for selection inputs
- Custom animated components

---

## Core Technologies

| Technology | Purpose |
|------------|---------|
| React Native | Cross-platform mobile framework |
| Firebase Firestore | Cloud database for suggestions/reports |
| OneSignal | Push notification service |
| AsyncStorage | Local persistent storage |
| React Navigation | Screen navigation |
| react-native-sound | Audio playback |
| Fuse.js | Fuzzy search functionality |
| transliteration | Script transliteration |

---

## File Structure

```
src/
├── assets/              # Images and static assets
├── components/          # Reusable UI components
│   ├── DetailPageComponents/  # Detail page sub-components
│   │   ├── ActionButtons.js
│   │   ├── AudioPlayer.js
│   │   ├── CollectionsModal.js
│   │   ├── DeleteConfirmationModal.js
│   │   ├── LyricsContent.js
│   │   ├── MediaContent.js
│   │   ├── NavigationHandler.js
│   │   └── RelatedSongs.js
│   ├── CreateCollectionModal.js
│   ├── CustomMaterialMenu.js
│   ├── DetailPage.js
│   ├── EditCollectionModal.js
│   ├── EmptyList.js
│   ├── ItemGrid.js
│   ├── LanguageSelectionModal.js
│   ├── List.js
│   ├── ListItem.js
│   ├── Search.js
│   ├── SplashScreen.js
│   └── TagItem.js
├── config/
│   └── dataService.js   # Data fetching and caching
├── context/             # React Context providers
│   ├── FontSizeContext.js
│   ├── LanguageContext.js
│   └── SingerModeContext.js
├── firebase/
│   └── config.js        # Firebase configuration
├── hooks/
│   └── useAnimations.js # Custom animation hooks
├── screen/
│   ├── category/        # Category tab screens
│   ├── home/            # Home tab screens
│   ├── profile/         # Profile tab screens
│   └── singer/          # Singer mode screens
├── theme/
│   └── theme.js         # Color definitions
└── utils/
    └── PermissionService.js  # Permission handling
```

---

## Supported Languages

| Language | Code | Display Name |
|----------|------|--------------|
| Gujarati | 0 | ગુજરાતી |
| Hindi | 1 | हिन्दी |
| English | 2 | English (fallback) |

---

## Theme Support

### Light Theme
- White/light gray backgrounds
- Dark text
- Accent color for primary elements

### Dark Theme
- Dark backgrounds
- Light text
- Adjusted accent colors for visibility

### System Theme
- Automatically follows device setting
- Smooth transition animations

---

## Platform Support

- **Android** - Full support
- **iOS** - Full support

---

*Last Updated: January 2026*
