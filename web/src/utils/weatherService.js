export const getConditionLabelAndIcon = (code) => {
  if (code === 0) return { label: 'Clear Sky', icon: 'sun' };
  if (code === 1) return { label: 'Mainly Clear', icon: 'sun' };
  if (code === 2) return { label: 'Partly Cloudy', icon: 'cloud' };
  if (code === 3) return { label: 'Overcast', icon: 'cloud' };
  if (code === 45 || code === 48) return { label: 'Foggy', icon: 'wind' };
  if (code >= 51 && code <= 57) return { label: 'Drizzle', icon: 'cloud-rain' };
  if (code >= 61 && code <= 67) return { label: 'Rainy', icon: 'cloud-rain' };
  if (code >= 71 && code <= 77) return { label: 'Snowy', icon: 'cloud-snow' };
  if (code >= 80 && code <= 82) return { label: 'Showers', icon: 'cloud-rain' };
  if (code === 85 || code === 86) return { label: 'Snow Showers', icon: 'cloud-snow' };
  if (code >= 95) return { label: 'Thunderstorm', icon: 'cloud-lightning' };
  return { label: 'Partly Cloudy', icon: 'cloud' };
};

export const fetchLocationByIP = async () => {
  try {
    const response = await fetch('https://ipapi.co/json/');
    if (!response.ok) throw new Error('IP lookup failed');
    const data = await response.json();
    if (data && data.latitude && data.longitude) {
      return {
        latitude: data.latitude,
        longitude: data.longitude,
        city: data.city || 'Mumbai',
        country: data.country_name || 'India',
      };
    }
  } catch (error) {
    console.warn('IP geolocating failed, falling back to default:', error);
  }
  return {
    latitude: 19.076,
    longitude: 72.8777,
    city: 'Mumbai',
    country: 'India',
  };
};

export const fetchLocationByCity = async (cityName) => {
  try {
    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`
    );
    if (!response.ok) throw new Error('Geocoding search failed');
    const data = await response.json();
    if (data.results && data.results.length > 0) {
      const result = data.results[0];
      return {
        latitude: result.latitude,
        longitude: result.longitude,
        city: result.name,
        country: result.country || '',
      };
    }
    throw new Error('City not found');
  } catch (error) {
    console.error('Geocoding error:', error);
    throw error;
  }
};

export const fetchWeather = async (latitude, longitude) => {
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=relativehumidity_2m,visibility&timezone=auto`
    );
    if (!response.ok) throw new Error('Weather forecast failed');
    const data = await response.json();
    
    if (data.current_weather) {
      const cw = data.current_weather;
      const { label, icon } = getConditionLabelAndIcon(cw.weathercode);
      
      let humidity = '70%';
      let visibility = '10 km';
      if (data.hourly) {
        const hourIdx = new Date().getHours();
        if (data.hourly.relativehumidity_2m && data.hourly.relativehumidity_2m[hourIdx] !== undefined) {
          humidity = `${data.hourly.relativehumidity_2m[hourIdx]}%`;
        }
        if (data.hourly.visibility && data.hourly.visibility[hourIdx] !== undefined) {
          visibility = `${Math.round(data.hourly.visibility[hourIdx] / 1000)} km`;
        }
      }
      
      const temp = Math.round(cw.temperature);
      let feelsLike = temp;
      if (temp > 27) {
        feelsLike = temp + 2;
      } else if (temp < 15) {
        feelsLike = temp - 1;
      }

      return {
        temp,
        condition: label,
        icon,
        wind: `${Math.round(cw.windspeed)} km/h`,
        humidity,
        visibility,
        feelsLike: `${feelsLike}°C`,
      };
    }
    throw new Error('No current weather data');
  } catch (error) {
    console.error('Weather fetching error:', error);
    throw error;
  }
};
