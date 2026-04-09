'use client';

import { useEffect, useState } from 'react';

const WMO_CODES: Record<number, { label: string; icon: string }> = {
  0: { label: 'Clear sky', icon: '☀️' },
  1: { label: 'Mainly clear', icon: '🌤️' },
  2: { label: 'Partly cloudy', icon: '⛅' },
  3: { label: 'Overcast', icon: '☁️' },
  45: { label: 'Foggy', icon: '🌫️' },
  48: { label: 'Foggy', icon: '🌫️' },
  51: { label: 'Light drizzle', icon: '🌦️' },
  53: { label: 'Drizzle', icon: '🌦️' },
  55: { label: 'Heavy drizzle', icon: '🌧️' },
  61: { label: 'Light rain', icon: '🌧️' },
  63: { label: 'Rain', icon: '🌧️' },
  65: { label: 'Heavy rain', icon: '🌧️' },
  71: { label: 'Light snow', icon: '🌨️' },
  73: { label: 'Snow', icon: '❄️' },
  75: { label: 'Heavy snow', icon: '❄️' },
  80: { label: 'Rain showers', icon: '🌦️' },
  81: { label: 'Rain showers', icon: '🌧️' },
  82: { label: 'Heavy showers', icon: '⛈️' },
  95: { label: 'Thunderstorm', icon: '⛈️' },
};

export default function LisbonWeather() {
  const [weather, setWeather] = useState<{ temp: number; code: number; high: number; low: number } | null>(null);

  useEffect(() => {
    fetch('https://api.open-meteo.com/v1/forecast?latitude=38.7169&longitude=-9.1395&current=temperature_2m,weathercode&daily=temperature_2m_max,temperature_2m_min&timezone=Europe/Lisbon&forecast_days=1')
      .then((r) => r.json())
      .then((d) => {
        setWeather({
          temp: Math.round(d.current.temperature_2m),
          code: d.current.weathercode,
          high: Math.round(d.daily.temperature_2m_max[0]),
          low: Math.round(d.daily.temperature_2m_min[0]),
        });
      })
      .catch(() => {});
  }, []);

  if (!weather) return null;

  const condition = WMO_CODES[weather.code] || { label: 'Lisbon', icon: '🌡️' };

  return (
    <div className="flex items-center gap-3 bg-white border border-stone-100 px-4 py-3">
      <span className="text-2xl leading-none">{condition.icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-stone-400 font-medium">The current weather in Lisbon is</p>
        <p className="text-sm font-semibold text-ink leading-tight">{condition.label}</p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="font-display text-2xl text-ink leading-none">{weather.temp}°</p>
        <p className="text-2xs text-stone-400 mt-0.5">{weather.high}° / {weather.low}°</p>
      </div>
    </div>
  );
}
