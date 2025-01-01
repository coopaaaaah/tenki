'use client'

import React, { useEffect, useState } from "react";
import Image from "next/image";
import day from '../public/amcharts_weather_icons_1.0.0/static/day.svg';


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
  title: String;
}

function Loading({title}: LoadingProps) {
  return (
    <div className="flex">    
      <svg aria-hidden="true" className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
        <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
      </svg>
      <div className="p-2">Loading {title}</div>
    </div>
    )
}

interface ViewProps {
  coords: Coordinate;
  forecast: Forecast;
}

enum WeatherView {
  SIMPLE_VIEW,
  DAILY_VIEW
}

function View({coords, forecast}: ViewProps) {

  const [weatherView, setWeatherView] = React.useState(WeatherView.SIMPLE_VIEW)

  function renderView() {

    let view = null;

    switch(weatherView) {
      case WeatherView.SIMPLE_VIEW:
        view = (
          <div className="flex-auto content-center" onClick={()=>{setWeatherView(WeatherView.DAILY_VIEW)}}>
              <Image src={day} alt="day" className="animate-bounce" />
          </div>
        )
        break;
      case WeatherView.DAILY_VIEW:
        view = (      
          <div onClick={()=>{setWeatherView(WeatherView.SIMPLE_VIEW)}}>
            <div>Forecast</div>
            {forecast.timelines?.daily.map((day, index) => <div key={index}>{new Date(String(day.time)).getDate()} average {day.values.temperatureApparentAvg} C</div>)} 
          </div>
        )
        break;
      default:
        view = <div>Unable to weather view.</div>
      return view;
    }

    return view;
  }

  return (
    <div> 
      <div>
        Location: {coords.latitude}, {coords.longitude} 
      </div>
      {renderView()}
    </div>
  )
}

enum STEP {
  LOADING_COORDS,
  LOADING_FORECAST,
  LOADED_ALL
}

export default function Home() {

  const [coords, setCoords] = useState<Coordinate>(DEFAULT_COORDINATES);
  const [step, setStep] = useState<STEP>(STEP.LOADING_COORDS);
  const [forecast, setForecast] = useState<Forecast>({});

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          setStep(STEP.LOADING_FORECAST);
          const url = `https://api.tomorrow.io/v4/weather/forecast?location=${position.coords.latitude},${position.coords.longitude}&apikey=${process.env.NEXT_PUBLIC_WEATHER_API_TOKEN}`;
          const options = {method: 'GET', headers: {accept: 'application/json'}};
      
          fetch(url, options)
            .then(res => res.json())
            .then(json => setForecast(json))
            .catch(err => console.error(err))
            .finally(() => setStep(STEP.LOADED_ALL));
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  }, []);

  const getView = (step: STEP) => {

    let view = null;

    switch(step){
      case STEP.LOADING_COORDS:
        view = <Loading title="Coords"/>
        break;
      case STEP.LOADING_FORECAST:
        view = <Loading title="Forecast"/>
        break;
      case STEP.LOADED_ALL:
        view = (
            <View coords={coords} forecast={forecast} />
        )
        break;
      default:
        view = <div>Unable to determine view for step {step}.</div>
    }

    return view;
  }

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        {getView(step)}
       </main>
    </div>
  );
}
