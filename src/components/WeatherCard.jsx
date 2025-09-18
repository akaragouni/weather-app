import PropTypes from 'prop-types';

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

const formatTime = (timeString) => {
  const formatter = new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return formatter.format(new Date(timeString));
};

function WeatherCard({ locationLabel, weather }) {
  const { temperature, windspeed, weathercode, time } = weather;
  const description = weatherCodeDescription[weathercode] ?? 'Unknown conditions';

  return (
    <section className="weather-card" aria-live="polite">
      <h2 className="weather-card__location">{locationLabel}</h2>
      <p className="weather-card__updated">Updated {formatTime(time)}</p>
      <div className="weather-card__details">
        <div className="weather-card__temperature">
          <span className="weather-card__value">{temperature.toFixed(1)}</span>
          <span className="weather-card__unit">°C</span>
        </div>
        <div className="weather-card__meta">
          <p>{description}</p>
          <p>Wind: {windspeed.toFixed(1)} km/h</p>
        </div>
      </div>
    </section>
  );
}

WeatherCard.propTypes = {
  locationLabel: PropTypes.string.isRequired,
  weather: PropTypes.shape({
    temperature: PropTypes.number.isRequired,
    windspeed: PropTypes.number.isRequired,
    weathercode: PropTypes.number.isRequired,
    time: PropTypes.string.isRequired,
  }).isRequired,
};

export default WeatherCard;
