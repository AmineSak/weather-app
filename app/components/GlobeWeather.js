"use client";
import React, { useState, useRef, useCallback, useEffect } from "react";
import Globe from "react-globe.gl";

const GlobeWeather = () => {
  const globeEl = useRef();
  const [weather, setWeather] = useState(null);
  const [clickedCoords, setClickedCoords] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Function to fetch weather data from our API route
  const fetchWeather = useCallback(async (lat, lon) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      console.log(data);
      setWeather(data);
    } catch (error) {
      console.error("Error fetching weather:", error);
      setWeather(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Auto-rotate
    globeEl.current.controls().autoRotate = true;
    globeEl.current.controls().autoRotateSpeed = 0.2;
  }, []);

  // Handle globe click and get coordinates directly from the event
  const handleGlobeClick = useCallback(
    ({ lat, lng: lon }) => {
      // Round coordinates to 4 decimal places for cleaner display
      const roundedLat = parseFloat(lat.toFixed(4));
      const roundedLon = parseFloat(lon.toFixed(4));

      setClickedCoords({ lat: roundedLat, lon: roundedLon });
      fetchWeather(roundedLat, roundedLon);
    },
    [fetchWeather]
  );

  return (
    <div className="w-full min-h-screen flex-col flex justify-center items-center p-4">
      <h2 className="text-2xl font-bold">Interactive Weather Globe</h2>
      <div className="flex flex-row w-full overflow-auto">
        <div className="w-full h-auto relative mx-auto">
          <Globe
            ref={globeEl}
            globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
            bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
            onGlobeClick={handleGlobeClick}
            atmosphereAltitude={0.25}
            enablePointerInteraction={true}
            animateIn={true}
            width={500}
          />
        </div>

        {clickedCoords && (
          <div className="mt-6 p-4 bg-white rounded-lg shadow-md">
            {isLoading ? (
              <p className="text-gray-600">Loading weather data...</p>
            ) : weather ? (
              <>
                <h3 className="text-xl font-semibold mb-2">
                  Weather at {weather.location.name}
                </h3>
                <div className="space-y-2">
                  <p className="text-lg">
                    Temperature:{" "}
                    <span className="font-medium">
                      {weather.current.temperature}°C
                    </span>
                  </p>
                  <p className="text-lg">
                    Conditions:{" "}
                    <span className="font-medium">
                      {weather.current.weather_descriptions.join(", ")}
                    </span>
                  </p>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <p className="text-sm text-gray-600">Humidity</p>
                      <p className="font-medium">{weather.current.humidity}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Wind Speed</p>
                      <p className="font-medium">
                        {weather.current.wind_speed} km/h
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Pressure</p>
                      <p className="font-medium">
                        {weather.current.pressure} mb
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Visibility</p>
                      <p className="font-medium">
                        {weather.current.visibility} km
                      </p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-red-600">
                Failed to load weather data. Please try again.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GlobeWeather;
