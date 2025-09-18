import { useEffect, useMemo, useState } from 'react';
import WeatherCard from './components/WeatherCard.jsx';

const DEFAULT_CITY = 'New York';

const formatError = (message) => `Oops! ${message}`;

const buildGeocodingUrl = (query) =>
  `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    query,
  )}&count=1&language=en&format=json`;

const buildWeatherUrl = (latitude, longitude) =>
  `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`;

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [locationLabel, setLocationLabel] = useState('');
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const hasWeather = useMemo(() => Boolean(weather), [weather]);

  useEffect(() => {
    const locate = () => {
      if (!('geolocation' in navigator)) {
        setError(formatError('Geolocation is not supported by your browser.'));
        fetchWeatherForCity(DEFAULT_CITY, { preserveError: true });
        return;
      }

      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchWeatherForCoords(latitude, longitude, 'Your location');
        },
        () => {
          setError(
            formatError(
              'We could not determine your location. Showing the default city instead.',
            ),
          );
          fetchWeatherForCity(DEFAULT_CITY, { preserveError: true });
        },
        { timeout: 10000 },
      );
    };

    locate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchWeatherForCoords = async (
    latitude,
    longitude,
    label,
    options = {},
  ) => {
    const { preserveError = false } = options;
    setLoading(true);
    if (!preserveError) {
      setError('');
    }
    try {
      const response = await fetch(buildWeatherUrl(latitude, longitude));
      if (!response.ok) {
        throw new Error('Failed to fetch current weather data.');
      }

      const data = await response.json();
      if (!data?.current_weather) {
        throw new Error('Weather data is unavailable for this location.');
      }

      setWeather({
        temperature: data.current_weather.temperature,
        windspeed: data.current_weather.windspeed,
        weathercode: data.current_weather.weathercode,
        time: data.current_weather.time,
      });
      setLocationLabel(label);
    } catch (err) {
      setError(formatError(err.message));
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchWeatherForCity = async (city, options = {}) => {
    const { preserveError = false } = options;
    setLoading(true);
    if (!preserveError) {
      setError('');
    }
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

      await fetchWeatherForCoords(result.latitude, result.longitude, result.name, {
        preserveError,
      });
    } catch (err) {
      setError(formatError(err.message));
      setWeather(null);
      setLoading(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!searchTerm.trim()) {
      return;
    }

    fetchWeatherForCity(searchTerm.trim());
    setSearchTerm('');
  };

  return (
    <div className="app">
      <header className="app__header">
        <h1>Weather App</h1>
        <p>Check the latest weather using your location or a city search.</p>
      </header>

      <form className="app__form" onSubmit={handleSubmit}>
        <input
          aria-label="City name"
          className="app__input"
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search for a city"
          type="search"
          value={searchTerm}
        />
        <button className="app__button" type="submit" disabled={loading}>
          {loading ? 'Loading…' : 'Search'}
        </button>
      </form>

      {error && <p className="app__error" role="alert">{error}</p>}

      {hasWeather && (
        <WeatherCard locationLabel={locationLabel} weather={weather} />
      )}

      {!hasWeather && !loading && !error && (
        <p className="app__placeholder">Enter a city to see the current weather.</p>
      )}
    </div>
  );
}

export default App;
