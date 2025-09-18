# Weather App

## Overview
The Weather App is a React single-page application that lets users check the
latest weather conditions. On load the app attempts to detect the user's
location via the browser geolocation API and automatically displays the current
conditions. Users can also search for any city to view its temperature,
conditions, and wind speed provided by the free Open-Meteo APIs.

## Tech Stack
- [React 18](https://react.dev/) for the UI
- [Vite](https://vitejs.dev/) for the build tooling and dev server
- [Open-Meteo](https://open-meteo.com/) for geocoding and weather data (no API key required)

## Setup Instructions
To set up the Weather App locally, follow these steps:

1. Install the dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open your browser and navigate to the printed local URL (default
   `http://localhost:5173`). Allow location access when prompted to see the
   weather for your current location.

## Available Scripts
- `npm run dev` – Start the Vite development server with hot module replacement.
- `npm run build` – Build the app for production.
- `npm run preview` – Preview the production build locally.
- `npm run lint` – Run ESLint against the source files.

## Environment Notes
The app uses the browser's `navigator.geolocation` API. If permission is denied
or the feature is unavailable, the app falls back to showing the weather for New
York City and allows searching for other cities via the search field.
