# Project Structure

This document outlines the professional project structure for Yashvi Pro Suite.

## Directory Structure

```
src/
├── components/          # Reusable UI components
│   ├── Navigation.jsx
│   ├── WatermarkOptions.jsx
│   ├── LogoSelector.jsx
│   ├── OutputFolderSelector.jsx
│   ├── ImageSelector.jsx
│   └── ProcessButton.jsx
│
├── pages/              # Page-level components
│   ├── Home.jsx
│   └── WatermarkStudio.jsx
│
├── hooks/              # Custom React hooks
│   ├── useElectron.js
│   └── useWatermark.js
│
├── utils/              # Utility functions
│   └── electron.js
│
├── constants/          # Application constants
│   └── watermarkOptions.js
│
├── styles/             # Global styles (optional)
│
├── App.js              # Main application component
├── App.css             # Main application styles
├── index.js            # Application entry point
└── index.css           # Global styles
```

## Component Organization

### Components (`/components`)
Reusable UI components that can be used across different pages:
- **Navigation**: Top navigation bar with logo and menu links
- **WatermarkOptions**: Watermark configuration panel (position, size, opacity, margin)
- **LogoSelector**: Logo selection interface with built-in and custom options
- **OutputFolderSelector**: Output folder selection component
- **ImageSelector**: Image selection and thumbnail display
- **ProcessButton**: Batch processing button with progress indicator

### Pages (`/pages`)
Page-level components that represent full views:
- **Home**: Landing page with hero section and feature cards
- **WatermarkStudio**: Main watermarking interface with master-detail layout

### Hooks (`/hooks`)
Custom React hooks for shared logic:
- **useElectron**: Electron API availability check
- **useWatermark**: Watermark state management and operations

### Utils (`/utils`)
Pure utility functions:
- **electron.js**: Electron API helpers and checks

### Constants (`/constants`)
Application-wide constants:
- **watermarkOptions.js**: Watermark position options, defaults, and ranges

## Best Practices

1. **Component Separation**: Each component has its own file with clear responsibilities
2. **Custom Hooks**: Business logic extracted into reusable hooks
3. **Constants**: Magic numbers and strings moved to constants
4. **Utilities**: Pure functions separated from components
5. **Single Responsibility**: Each component/hook has one clear purpose

## Future Improvements

- Move component-specific CSS to individual component files
- Add PropTypes or TypeScript for type safety
- Create a `context/` folder for React Context providers if needed
- Add `services/` folder for API calls if backend is added
- Create `types/` folder if using TypeScript

