import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Search,
  Wind,
  Droplets,
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Thermometer,
  Calendar,
  History,
  Activity,
  MapPin,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

const API_KEY = 'b092a99e8dd887287b3cfb33083bec67';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

function App() {
  const [city, setCity] = useState('New York');
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [airQuality, setAirQuality] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('current');

  const fetchWeatherData = async (searchCity) => {
    try {
      setLoading(true);
      setError(null);

      // Attempt real API call
      const currentRes = await axios.get(`${BASE_URL}/weather?q=${searchCity}&units=metric&appid=${API_KEY}`);
      const { lat, lon } = currentRes.data.coord;

      const [forecastRes, airRes] = await Promise.all([
        axios.get(`${BASE_URL}/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`),
        axios.get(`${BASE_URL}/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`)
      ]);

      setWeather(currentRes.data);
      setForecast(forecastRes.data);
      setAirQuality(airRes.data.list[0]);
      setLoading(false);
    } catch (err) {
      console.error('API Error, falling back to mock data:', err);

      const getSeed = (str) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
        return Math.abs(hash);
      };
      const seed = getSeed(searchCity);
      const tempBase = 12 + (seed % 20);
      const humBase = 20 + (seed % 60);

      // Map common cities to countries for demo mode realism
      const cityMapping = {
        'london': 'GB', 'dubai': 'AE', 'paris': 'FR', 'tokyo': 'JP',
        'mumbai': 'IN', 'delhi': 'IN', 'sydney': 'AU', 'new york': 'US',
        'toronto': 'CA', 'berlin': 'DE', 'rome': 'IT', 'madrid': 'ES'
      };
      const countryCode = cityMapping[searchCity.toLowerCase()] || 'World';

      const mockWeather = {
        name: searchCity,
        sys: { country: countryCode, sunrise: Math.floor(Date.now() / 1000) - 10000, sunset: Math.floor(Date.now() / 1000) + 10000 },
        main: { temp: tempBase, feels_like: tempBase - 2, humidity: humBase, pressure: 1000 + (seed % 30) },
        weather: [{ description: tempBase > 22 ? 'sunny' : 'partly cloudy', icon: tempBase > 22 ? '01d' : '02d', main: tempBase > 22 ? 'Clear' : 'Clouds' }],
        wind: { speed: 1 + (seed % 10) },
        visibility: 10000,
      };

      const mockForecast = {
        list: Array(40).fill(null).map((_, i) => ({
          dt: Math.floor(Date.now() / 1000) + i * 10800,
          main: { temp: tempBase + (Math.sin(i + seed) * 4) },
          weather: [{ main: tempBase > 22 ? 'Clear' : 'Clouds', icon: tempBase > 22 ? '01d' : '02d' }],
          pop: Math.abs(Math.sin(seed + i))
        }))
      };

      const mockAir = {
        main: { aqi: (seed % 5) + 1 },
        components: { pm2_5: 5.2, so2: 0.5, no2: 1.2, o3: 35.0 }
      };

      setWeather(mockWeather);
      setForecast(mockForecast);
      setAirQuality(mockAir);

      if (err.response?.status === 401) {
        setError(`Note: API Key unauthorized. Showing unique demo data for ${searchCity}.`);
      } else {
        setError("Location data not found. Showing demo data.");
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeatherData(city);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newCity = formData.get('city');
    if (newCity) {
      setCity(newCity);
      fetchWeatherData(newCity);
    }
  };

  const getWeatherIcon = (code) => {
    const icons = {
      '01': <Sun className="text-yellow-400" size={48} />,
      '02': <Cloud className="text-gray-300" size={48} />,
      '03': <Cloud className="text-gray-400" size={48} />,
      '04': <Cloud className="text-gray-500" size={48} />,
      '09': <CloudRain className="text-blue-400" size={48} />,
      '10': <CloudRain className="text-sky-400" size={48} />,
      '11': <CloudLightning className="text-purple-400" size={48} />,
      '13': <CloudSnow className="text-white" size={48} />,
      '50': <Activity className="text-gray-200" size={48} />,
    };
    const key = code?.substring(0, 2);
    return icons[key] || <Sun className="text-yellow-400" size={48} />;
  };

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center">
      {/* Header & Search */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-4xl mb-8 flex flex-col md:flex-row justify-between items-center gap-4"
      >
        <div className="flex items-center gap-2">
          <div className="p-3 glass-card bg-sky-500/20 rounded-2xl">
            <Cloud className="text-sky-400" size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Weather Forecasting</h1>
            <p className="text-slate-400 text-sm">Glassmorphic Weather Station</p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-auto">
          <input
            name="city"
            type="text"
            placeholder="Search city..."
            className="glass-input w-full md:w-64"
          />
          <button type="submit" className="glass-button flex items-center gap-2 bg-sky-600/20">
            <Search size={20} />
            <span>Search</span>
          </button>
        </form>
      </motion.div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-sky-500"></div>
        </div>
      ) : (
        weather ? (
          <div className="w-full max-w-6xl">
            {error && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="mb-6 p-4 glass-card border-rose-500/50 bg-rose-500/10 text-rose-300 text-center text-sm"
              >
                {error}
              </motion.div>
            )}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Main Weather Section */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="lg:col-span-2 flex flex-col gap-6"
              >
                {/* Current Weather Card */}
                <div className="glass-card p-8 relative overflow-hidden group">
                  <div className="absolute -top-24 -right-24 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl group-hover:bg-sky-500/20 transition-all duration-700"></div>

                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <div className="flex items-center gap-2 text-sky-400 mb-2 font-medium">
                        <MapPin size={18} />
                        <span>{weather.name}, {weather.sys.country}</span>
                      </div>
                      <h2 className="text-6xl font-bold mb-2">{Math.round(weather.main.temp)}°C</h2>
                      <p className="text-xl text-slate-300 capitalize">{weather.weather[0].description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-semibold mb-1">{format(new Date(), 'eeee')}</p>
                      <p className="text-slate-400">{format(new Date(), 'dd MMM, HH:mm')}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-white/10">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                      <Thermometer className="text-orange-400" size={24} />
                      <div>
                        <p className="text-xs text-slate-400">Feels Like</p>
                        <p className="font-semibold">{Math.round(weather.main.feels_like)}°C</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                      <Droplets className="text-blue-400" size={24} />
                      <div>
                        <p className="text-xs text-slate-400">Humidity</p>
                        <p className="font-semibold">{weather.main.humidity}%</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                      <Wind className="text-emerald-400" size={24} />
                      <div>
                        <p className="text-xs text-slate-400">Wind</p>
                        <p className="font-semibold">{weather.wind.speed} m/s</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                      <Activity className="text-purple-400" size={24} />
                      <div>
                        <p className="text-xs text-slate-400">Visibility</p>
                        <p className="font-semibold">{(weather.visibility / 1000).toFixed(1)} km</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tabs for Forecast / Detailed Stats */}
                <div className="flex gap-4 p-1 glass-card w-max rounded-xl">
                  <button
                    onClick={() => setActiveTab('current')}
                    className={`px-6 py-2 rounded-lg transition-all text-sm font-medium ${activeTab === 'current' ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30' : 'text-slate-400 hover:text-white'}`}
                  >
                    5-Day Forecast
                  </button>
                  <button
                    onClick={() => setActiveTab('history')}
                    className={`px-6 py-2 rounded-lg transition-all text-sm font-medium ${activeTab === 'history' ? 'bg-sky-400/20 text-sky-400 border border-sky-400/30' : 'text-slate-400 hover:text-white'}`}
                  >
                    Historical Trends
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  {activeTab === 'current' ? (
                    <motion.div
                      key="forecast"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4"
                    >
                      {forecast.list.filter((_, i) => i % 8 === 0).map((item, idx) => (
                        <div key={idx} className="glass-card p-4 flex flex-col items-center text-center gap-3 hover:bg-white/10 transition-colors">
                          <p className="text-sm font-medium text-slate-400">{format(new Date(item.dt * 1000), 'EEE')}</p>
                          {getWeatherIcon(item.weather[0].icon)}
                          <p className="text-xl font-bold">{Math.round(item.main.temp)}°</p>
                          <p className="text-xs text-slate-500 capitalize">{item.weather[0].main}</p>
                        </div>
                      ))}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="history"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                      <div className="glass-card p-6 flex flex-col gap-4">
                        <div className="flex items-center gap-2 text-sky-400 font-semibold mb-2">
                          <Clock size={20} />
                          <span>Hourly Breakdown</span>
                        </div>
                        <div className="space-y-3">
                          {forecast.list.slice(0, 6).map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center p-2 rounded-lg bg-white/5">
                              <span className="text-sm">{format(new Date(item.dt * 1000), 'HH:00')}</span>
                              <span className="font-bold">{Math.round(item.main.temp)}°C</span>
                              <span className="text-xs text-slate-400">{item.weather[0].main}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="glass-card p-6">
                        <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-2">
                          <Activity size={20} />
                          <span>Precipitation Chance</span>
                        </div>
                        <div className="h-40 flex items-end justify-between gap-2 px-2">
                          {forecast.list.slice(0, 8).map((item, idx) => (
                            <div key={idx} className="w-full bg-emerald-500/20 rounded-t-lg relative group" style={{ height: `${(item.pop || 0.1) * 100}%`, minHeight: '10%' }}>
                              <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[10px] p-1 rounded">
                                {Math.round(item.pop * 100)}%
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-between mt-2 text-[10px] text-slate-500">
                          <span>3h</span>
                          <span>6h</span>
                          <span>9h</span>
                          <span>12h</span>
                          <span>15h</span>
                          <span>18h</span>
                          <span>21h</span>
                          <span>24h</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Sidebar / Extra Info */}
              <motion.div
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="flex flex-col gap-6"
              >
                {/* Air Quality Card */}
                <div className="glass-card p-6 border-l-4 border-l-emerald-500">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Activity className="text-emerald-400" size={20} />
                      Air Quality
                    </h3>
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${airQuality.main.aqi <= 2 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-orange-500/20 text-orange-400'
                      }`}>
                      {['Excellent', 'Fair', 'Moderate', 'Poor', 'Very Poor'][airQuality.main.aqi - 1]}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 p-3 rounded-lg">
                      <p className="text-[10px] text-slate-500 mb-1">PM2.5</p>
                      <p className="font-bold">{airQuality.components.pm2_5.toFixed(1)}</p>
                    </div>
                    <div className="bg-white/5 p-3 rounded-lg">
                      <p className="text-[10px] text-slate-500 mb-1">SO2</p>
                      <p className="font-bold">{airQuality.components.so2.toFixed(1)}</p>
                    </div>
                    <div className="bg-white/5 p-3 rounded-lg">
                      <p className="text-[10px] text-slate-500 mb-1">NO2</p>
                      <p className="font-bold">{airQuality.components.no2.toFixed(1)}</p>
                    </div>
                    <div className="bg-white/5 p-3 rounded-lg">
                      <p className="text-[10px] text-slate-500 mb-1">O3</p>
                      <p className="font-bold">{airQuality.components.o3.toFixed(1)}</p>
                    </div>
                  </div>
                </div>

                {/* Sun & Moon Card */}
                <div className="glass-card p-6 flex flex-col gap-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-orange-500/20 rounded-xl">
                      <Sun className="text-orange-400" size={24} />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Sunrise</p>
                      <p className="font-semibold">{format(new Date(weather.sys.sunrise * 1000), 'HH:mm')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-right justify-end md:justify-start">
                    <div className="md:order-last p-3 bg-purple-500/20 rounded-xl">
                      <Clock className="text-purple-400" size={24} />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Sunset</p>
                      <p className="font-semibold">{format(new Date(weather.sys.sunset * 1000), 'HH:mm')}</p>
                    </div>
                  </div>
                </div>

                {/* Weather Map Card */}
                <div className="glass-card p-1 relative h-48 overflow-hidden rounded-3xl group cursor-pointer">
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent z-10"></div>
                  <div className="absolute bottom-4 left-4 z-20">
                    <p className="font-bold text-white">Interactive Map</p>
                    <p className="text-[10px] text-slate-300">View Precipitation & Clouds</p>
                  </div>
                  <img
                    src={`https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=400`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    alt="Weather map"
                  />
                </div>
              </motion.div>
            </div>
          </div>
        ) : (
          <div className="glass-card p-8 text-center max-w-md">
            <p className="text-rose-400 mb-4">{error || 'Unable to load weather data'}</p>
            <button onClick={() => fetchWeatherData(city)} className="glass-button">Retry</button>
          </div>
        )
      )}

      {/* Footer */}
      <footer className="mt-12 text-slate-500 text-sm pb-8">
        Powered by OpenWeatherMap API • Built with ❤️ by Weather Forecasting
      </footer>
    </div>
  );
}

export default App;
