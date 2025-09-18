# Weather App

## Overview
The Weather App is a lightweight client-side experience that shows the latest
weather conditions for a detected location or a searched city. When the page
loads it attempts to determine your position with the Geolocation API. If the
request fails or the browser does not support geolocation, the app falls back to
New York City and allows manual searches.

## Tech Stack
- Modern browser features (ES modules, Fetch API, and the Geolocation API)
- Vanilla JavaScript for interactivity
- CSS for styling
- [Open-Meteo](https://open-meteo.com/) for geocoding and weather data (no API key required)

## Setup Instructions
No package installation or build step is required. Open `index.html` directly in
a browser or serve the project with any static file server. For example:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Available Scripts
- `npm test` – Prints a message explaining that no automated tests are defined.

## Environment Notes
The app uses the browser's `navigator.geolocation` API. If permission is denied
or the feature is unavailable, the app falls back to showing the weather for New
York City and allows searching for other cities via the search field.
