const DEFAULT_CITY = 'New York';

const weatherCodeDescription = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Depositing rime fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  56: 'Light freezing drizzle',
  57: 'Dense freezing drizzle',
  61: 'Slight rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  66: 'Light freezing rain',
  67: 'Heavy freezing rain',
  71: 'Slight snow fall',
  73: 'Moderate snow fall',
  75: 'Heavy snow fall',
  77: 'Snow grains',
  80: 'Slight rain showers',
  81: 'Moderate rain showers',
  82: 'Violent rain showers',
  85: 'Slight snow showers',
  86: 'Heavy snow showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with slight hail',
  99: 'Thunderstorm with heavy hail',
};

const state = {
  error: '',
  loading: false,
  locationLabel: '',
  weather: null,
};

const elements = {};

let requestCounter = 0;
let latestRequestId = 0;

const formatError = (message) => `Oops! ${message}`;

const buildGeocodingUrl = (query) =>
  `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    query,
  )}&count=1&language=en&format=json`;

const buildWeatherUrl = (latitude, longitude) =>
  `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`;

const formatTime = (timeString, timeZone) => {
  const options = {
    dateStyle: 'medium',
    timeStyle: 'short',
  };

  if (timeZone) {
    options.timeZone = timeZone;
  }

  const formatter = new Intl.DateTimeFormat(undefined, options);

  return formatter.format(new Date(timeString));
};

function assignElements() {
  elements.form = document.querySelector('[data-element="form"]');
  elements.input = document.querySelector('[data-element="input"]');
  elements.button = document.querySelector('[data-element="button"]');
  elements.error = document.querySelector('[data-element="error"]');
  elements.placeholder = document.querySelector('[data-element="placeholder"]');
  elements.card = document.querySelector('[data-element="weather-card"]');
  elements.cardLocation = document.querySelector('[data-element="weather-location"]');
  elements.cardUpdated = document.querySelector('[data-element="weather-updated"]');
  elements.cardTemperatureValue = document.querySelector('[data-element="weather-temperature"]');
  elements.cardDescription = document.querySelector('[data-element="weather-description"]');
  elements.cardWind = document.querySelector('[data-element="weather-wind"]');
}

function updateState(updates) {
  Object.assign(state, updates);
  render();
}

function beginRequest(existingRequestId) {
  if (typeof existingRequestId === 'number') {
    return existingRequestId;
  }

  const newRequestId = ++requestCounter;
  latestRequestId = newRequestId;
  return newRequestId;
}

function updateStateIfActive(requestId, updates) {
  if (requestId === latestRequestId) {
    updateState(updates);
  }
}

function render() {
  const { loading, error, weather, locationLabel } = state;

  if (elements.button) {
    elements.button.disabled = loading;
    elements.button.textContent = loading ? 'Loading…' : 'Search';
  }

  if (elements.error) {
    if (error) {
      elements.error.textContent = error;
      elements.error.hidden = false;
    } else {
      elements.error.textContent = '';
      elements.error.hidden = true;
    }
  }

  if (elements.placeholder) {
    const shouldShowPlaceholder = !weather && !loading && !error;
    elements.placeholder.hidden = !shouldShowPlaceholder;
  }

  if (!elements.card) {
    return;
  }

  if (weather) {
    const { temperature, windspeed, weathercode, time, timezone } = weather;
    const description = weatherCodeDescription[weathercode] ?? 'Unknown conditions';

    elements.card.hidden = false;
    elements.cardLocation.textContent = locationLabel;
    elements.cardUpdated.textContent = `Updated ${formatTime(time, timezone)}`;
    elements.cardTemperatureValue.textContent = temperature.toFixed(1);
    elements.cardDescription.textContent = description;
    elements.cardWind.textContent = `Wind: ${windspeed.toFixed(1)} km/h`;
  } else {
    elements.card.hidden = true;
  }
}

async function fetchWeatherForCoords(latitude, longitude, label, options = {}) {
  const { preserveError = false, requestId: providedRequestId } = options;
  const requestId = beginRequest(providedRequestId);
  const updateIfActive = (updates) => updateStateIfActive(requestId, updates);

  const initialUpdates = { loading: true };
  if (!preserveError) {
    initialUpdates.error = '';
  }
  updateIfActive(initialUpdates);

  try {
    const response = await fetch(buildWeatherUrl(latitude, longitude));
    if (!response.ok) {
      throw new Error('Failed to fetch current weather data.');
    }

    const data = await response.json();
    const current = data?.current_weather;
    if (!current) {
      throw new Error('Weather data is unavailable for this location.');
    }

    updateIfActive({
      weather: {
        temperature: current.temperature,
        windspeed: current.windspeed,
        weathercode: current.weathercode,
        time: current.time,
        timezone: data?.timezone ?? null,
        utcOffsetSeconds: data?.utc_offset_seconds ?? null,
      },
      locationLabel: label,
    });

    return true;
  } catch (error) {
    updateIfActive({
      error: formatError(error.message),
      weather: null,
      locationLabel: '',
    });
    return false;
  } finally {
    updateIfActive({ loading: false });
  }
}

async function fetchWeatherForCity(city, options = {}) {
  const { preserveError = false } = options;
  const requestId = beginRequest();
  const updateIfActive = (updates) => updateStateIfActive(requestId, updates);

  const initialUpdates = { loading: true };
  if (!preserveError) {
    initialUpdates.error = '';
  }
  updateIfActive(initialUpdates);

  try {
    const response = await fetch(buildGeocodingUrl(city));
    if (!response.ok) {
      throw new Error('Failed to find the requested city.');
    }

    const data = await response.json();
    const result = data?.results?.[0];
    if (!result) {
      throw new Error('No matching city found.');
    }

    const success = await fetchWeatherForCoords(
      result.latitude,
      result.longitude,
      result.name,
      {
        preserveError,
        requestId,
      },
    );

    if (!success) {
      return false;
    }

    return true;
  } catch (error) {
    updateIfActive({
      error: formatError(error.message),
      weather: null,
      loading: false,
      locationLabel: '',
    });
    return false;
  }
}

function handleSubmit(event) {
  event.preventDefault();
  const value = elements.input.value.trim();
  if (!value) {
    return;
  }

  fetchWeatherForCity(value);
  elements.input.value = '';
}

function locateUser() {
  if (!('geolocation' in navigator)) {
    updateState({ error: formatError('Geolocation is not supported by your browser.') });
    fetchWeatherForCity(DEFAULT_CITY, { preserveError: true });
    return;
  }

  updateState({ loading: true, error: '' });

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      fetchWeatherForCoords(latitude, longitude, 'Your location');
    },
    () => {
      updateState({
        error: formatError(
          'We could not determine your location. Showing the default city instead.',
        ),
      });
      fetchWeatherForCity(DEFAULT_CITY, { preserveError: true });
    },
    { timeout: 10000 },
  );
}

window.addEventListener('DOMContentLoaded', () => {
  assignElements();
  render();
  elements.form.addEventListener('submit', handleSubmit);
  locateUser();
});
