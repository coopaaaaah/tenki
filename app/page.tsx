'use client'

import React, { useEffect, useState } from "react";


interface Coordinate {
  latitude: number,
  longitude: number
}

const DEFAULT_COORDINATES: Coordinate = {
  latitude: 90,
  longitude: 0
}

interface ForecastValue {
  cloudBase: number;
  cloudCeiling: number;
  cloudCover: number;
  dewPoint: number;
  freezingRainIntensity: number;
  humidity: number;
  precipitationProbability: number;
  pressureSurfaceLevel: number;
  rainIntensity: number;
  sleetIntensity: number;
  snowIntensity: number;
  temperature: number;
  temperatureApparent: number;
  uvHealthConcern: number;
  uvIndex: number;
  visibility: number;
  weatherCode: number;
  windDirection: number;
  windGust: number;
  windSpeed: number;
}

interface DailyForecastValue extends ForecastValue {
  temperatureApparentAvg: number;
  temperatureApparentMax: number;
  temperatureApparentMin: number;
}

interface TimelineValue {
  time: String;
  values: ForecastValue;
}

interface DailyTimelineValue extends TimelineValue {
  time: String;
  values: DailyForecastValue;
}


interface Forecast {
  timelines?: {
    hourly: Array<TimelineValue>;
    minutely: Array<TimelineValue>;
    daily: Array<DailyTimelineValue>;
  },
  location?: {
    lat: number,
    lon: number,
    name: String,
    type: String
  }
}

interface LoadingProps {
  isLoading: boolean;
  title: String;
  children: React.ReactNode;
}

function Loading({isLoading, title, children}: LoadingProps) {
  return (isLoading ? <div>Loading {title}</div> : children)
}

export default function Home() {

  const [coords, setCoords] = useState<Coordinate>(DEFAULT_COORDINATES);
  const [isLoadingCoords, setLoadingCoords] = useState<boolean>(true);
  const [forecast, setForecast] = useState<Forecast>({});
  const [isLoadingForecast, setLoadingForecast] = useState<boolean>(true);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          setLoadingCoords(false);
          const url = `https://api.tomorrow.io/v4/weather/forecast?location=${position.coords.latitude},${position.coords.longitude}&apikey=${process.env.NEXT_PUBLIC_WEATHER_API_TOKEN}`;
          const options = {method: 'GET', headers: {accept: 'application/json'}};
      
          fetch(url, options)
            .then(res => res.json())
            .then(json => setForecast(json))
            .catch(err => console.error(err))
            .finally(() => setLoadingForecast(false));
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  }, []);

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <div>
          Weather App
        </div>
        <Loading isLoading={isLoadingCoords} title="Coordinates">
          <div>
            Current Location: {coords.latitude}, {coords.longitude}
          </div>
        </Loading>
        <Loading isLoading={isLoadingForecast} title="Forecast">
          <div>
            {forecast.timelines?.daily.map((day, index) => <div key={index}>{new Date(String(day.time)).getDate()} average {day.values.temperatureApparentAvg} C</div>)}
          </div>
        </Loading>
       </main>
    </div>
  );
}
