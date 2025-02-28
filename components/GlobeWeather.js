"use client";
import React, { useState, useRef, useCallback, useEffect } from "react";
import Globe from "react-globe.gl";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { landmarks } from "@/public/landmarks";
import { Button } from "./ui/button";

const GlobeWeather = () => {
  const globeEl = useRef();
  const containerRef = useRef();
  const [weather, setWeather] = useState(null);
  const [clickedCoords, setClickedCoords] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [facts, setFacts] = useState([]);
  const [factsLoading, setFactsLoading] = useState(false);
  const [factsDialogOpen, setFactsDialogOpen] = useState(false);

  const fetchFacts = async (country) => {
    setFactsLoading(true);
    setFactsDialogOpen(true);
    setFacts([]);

    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPEN_ROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "cognitivecomputations/dolphin3.0-r1-mistral-24b:free",
          messages: [
            {
              role: "user",
              content: `Generate 5 facts about this country:${country}, Give concise answer only the facts no preface phrases`,
            },
          ],
        }),
      });

      if (!res.ok) {
        throw new Error(
          `HTTP error! Unable to generate facts status: ${res.status}`
        );
      }

      const data = await res.json();
      // Process the content to split into individual facts
      const factContent = data.choices[0].message.content;
      const factsList = factContent
        .split(/\d+\.|\n-|\n•|\n/)
        .map((fact) => fact.trim())
        .filter((fact) => fact.length > 0);

      setFacts(factsList);
      console.log("Facts loaded:", factsList);
    } catch (error) {
      console.error(error);
      setFacts(["Unable to load facts. Please try again later."]);
    } finally {
      setFactsLoading(false);
    }
  };

  // Function to fetch weather data from our API route
  const fetchWeather = useCallback(async (lat, lon) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      setWeather(data);
      setIsOpen(true);
    } catch (error) {
      console.error("Error fetching weather:", error);
      setWeather(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update dimensions based on container size
  const updateDimensions = useCallback(() => {
    if (containerRef.current) {
      const { width, height } = containerRef.current.getBoundingClientRect();
      setDimensions({
        width: Math.min(width, 1000),
        height: Math.min(height, window.innerHeight * 0.7),
      });
    }
  }, []);

  useEffect(() => {
    // Initial update
    updateDimensions();

    // Add resize event listener
    window.addEventListener("resize", updateDimensions);

    // Auto-rotate
    if (globeEl.current) {
      globeEl.current.controls().autoRotate = true;
      globeEl.current.controls().autoRotateSpeed = 0.1;

      // Adjust control sensitivity for touch devices
      globeEl.current.controls().enableDamping = true;
      globeEl.current.controls().dampingFactor = 0.25;
      globeEl.current.controls().rotateSpeed = 0.5;

      // Set initial camera position to show more of the globe
      globeEl.current.pointOfView({ altitude: 2.5 });
    }

    // Clean up on unmount
    return () => {
      window.removeEventListener("resize", updateDimensions);
    };
  }, [updateDimensions]);

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

  // Handle landmark click
  const handleLandmarkClick = useCallback(
    (landmark) => {
      setClickedCoords({ lat: landmark.lat, lon: landmark.lng });
      fetchWeather(landmark.lat, landmark.lng);

      // Point the camera at the selected landmark
      if (globeEl.current) {
        globeEl.current.pointOfView(
          {
            lat: landmark.lat,
            lng: landmark.lng,
            altitude: 1.5,
          },
          1000
        ); // 1000ms animation duration
      }
    },
    [fetchWeather]
  );

  const drawerSize = useCallback(() => {
    // Calculate drawer size based on screen width
    const screenWidth = typeof window !== "undefined" ? window.innerWidth : 0;
    if (screenWidth < 640) return "w-full sm:max-w-sm"; // Full width on mobile
    return "w-80";
  }, []);

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center z-0 p-2 sm:p-4 bg-gradient-to-b from-blue-50 to-blue-100">
      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-800 mb-2 sm:mb-6 text-center">
        Interactive World Landmarks & Weather
      </h2>
      <p className="text-xs sm:text-sm md:text-base text-gray-600 mb-2 sm:mb-4 text-center">
        Discover famous landmarks and check local weather around the globe
      </p>

      <div
        ref={containerRef}
        className="relative w-full max-w-4xl h-[300px] xs:h-[400px] sm:h-[500px] md:h-[600px] hover:cursor-pointer"
      >
        <Globe
          ref={globeEl}
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
          bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
          onGlobeClick={handleGlobeClick}
          atmosphereAltitude={0.25}
          enablePointerInteraction={true}
          animateIn={true}
          width={dimensions.width}
          height={dimensions.height}
          backgroundColor="rgba(0,0,0,0)"
          // Points configuration
          pointsData={landmarks}
          pointLat="lat"
          pointLng="lng"
          pointColor="color"
          pointAltitude={0.1}
          pointRadius={0.25}
          pointsMerge={false}
          pointLabel={(d) => `${d.name}, ${d.country}`}
          onPointClick={handleLandmarkClick}
          // Point label styling
          pointLabelSize={10}
          pointLabelDotRadius={1}
          pointLabelHoverColor={() => "white"}
          pointLabelHoverBgColor={(d) => d.color}
        />
      </div>

      <div className="text-xs sm:text-sm text-gray-500 mt-2 sm:mt-4 text-center">
        Click on a landmark or any location to check the local weather
      </div>

      {/* shadcn Drawer Component with responsive sizing */}
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerContent className={drawerSize()}>
          <div className="mx-auto w-full">
            <DrawerHeader>
              {isLoading ? (
                <div className="flex items-center justify-center p-2 sm:p-4">
                  <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-blue-500"></div>
                  <p className="ml-2 text-xs sm:text-sm text-gray-600">
                    Loading weather data...
                  </p>
                </div>
              ) : weather ? (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex-1 mr-2">
                      <DrawerTitle className="text-lg sm:text-2xl font-bold truncate">
                        {weather.location.name}
                      </DrawerTitle>
                      <DrawerDescription className="text-xs sm:text-sm text-gray-500">
                        {weather.location.country}
                      </DrawerDescription>
                    </div>
                    <div className="text-xl sm:text-3xl font-bold text-blue-600">
                      {weather.current.temperature}°C
                    </div>
                  </div>
                </>
              ) : (
                <DrawerTitle className="text-red-600 text-sm sm:text-base">
                  Failed to load weather data
                </DrawerTitle>
              )}
            </DrawerHeader>

            {weather && !isLoading && (
              <div className="p-2 sm:p-4 space-y-4 sm:space-y-6">
                <div className="bg-blue-50 p-2 sm:p-3 rounded-lg">
                  <div className="text-blue-800 font-medium text-center text-sm sm:text-lg mb-2">
                    {weather.current.weather_descriptions.join(", ")}
                  </div>

                  <div className="grid grid-cols-2 gap-2 sm:gap-4">
                    <div className="bg-white p-2 sm:p-3 rounded shadow-sm">
                      <div className="text-xs sm:text-sm text-gray-500">
                        Humidity
                      </div>
                      <div className="flex items-center mt-1">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 mr-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
                          />
                        </svg>
                        <span className="text-sm sm:text-lg font-medium">
                          {weather.current.humidity}%
                        </span>
                      </div>
                    </div>
                    <div className="bg-white p-2 sm:p-3 rounded shadow-sm">
                      <div className="text-xs sm:text-sm text-gray-500">
                        Wind Speed
                      </div>
                      <div className="flex items-center mt-1">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 mr-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                          />
                        </svg>
                        <span className="text-sm sm:text-lg font-medium">
                          {weather.current.wind_speed} km/h
                        </span>
                      </div>
                    </div>
                    <div className="bg-white p-2 sm:p-3 rounded shadow-sm">
                      <div className="text-xs sm:text-sm text-gray-500">
                        Pressure
                      </div>
                      <div className="flex items-center mt-1">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 mr-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        <span className="text-sm sm:text-lg font-medium">
                          {weather.current.pressure} mb
                        </span>
                      </div>
                    </div>
                    <div className="bg-white p-2 sm:p-3 rounded shadow-sm">
                      <div className="text-xs sm:text-sm text-gray-500">
                        Visibility
                      </div>
                      <div className="flex items-center mt-1">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 mr-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                        <span className="text-sm sm:text-lg font-medium">
                          {weather.current.visibility} km
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-xs sm:text-sm text-gray-500 mb-1">
                    Coordinates
                  </div>
                  <div className="bg-white p-2 sm:p-3 rounded shadow-sm text-center">
                    <span className="font-mono text-xs sm:text-sm">
                      {clickedCoords?.lat}, {clickedCoords?.lon}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-right text-gray-500">
                  Last updated: {new Date().toLocaleTimeString()}
                </div>
                <Button
                  onClick={() => fetchFacts(weather.location.country)}
                  className="w-full"
                >
                  ✨ Generate 5 facts about {weather.location.country} ✨
                </Button>
              </div>
            )}

            <DrawerFooter className="sm:mt-0 p-2 sm:p-4">
              <DrawerClose asChild>
                <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-1.5 sm:py-2 px-4 rounded text-sm sm:text-base transition">
                  Close
                </button>
              </DrawerClose>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Facts Dialog */}
      <Dialog open={factsDialogOpen} onOpenChange={setFactsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl text-center">
              {weather?.location?.country
                ? `Facts about ${weather.location.country}`
                : "Country Facts"}
            </DialogTitle>
            <DialogDescription className="text-center text-sm text-gray-500">
              Interesting facts about this country
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {factsLoading ? (
              <div className="space-y-4">
                {/* AI Thinking Message */}
                <div className="bg-blue-50 p-3 rounded-lg flex items-center justify-center">
                  <div className="animate-pulse flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2 text-blue-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                    <p className="text-blue-700 font-medium">
                      AI is thinking of interesting facts...
                    </p>
                  </div>
                </div>

                {/* Skeleton Loading Elements */}
                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="bg-gray-200 rounded-full w-6 h-6 flex-shrink-0 mr-2"></div>
                    <Skeleton className="h-4 w-full" />
                  </div>
                  <div className="flex items-start">
                    <div className="bg-gray-200 rounded-full w-6 h-6 flex-shrink-0 mr-2"></div>
                    <Skeleton className="h-4 w-full" />
                  </div>
                  <div className="flex items-start">
                    <div className="bg-gray-200 rounded-full w-6 h-6 flex-shrink-0 mr-2"></div>
                    <Skeleton className="h-4 w-11/12" />
                  </div>
                  <div className="flex items-start">
                    <div className="bg-gray-200 rounded-full w-6 h-6 flex-shrink-0 mr-2"></div>
                    <Skeleton className="h-4 w-full" />
                  </div>
                  <div className="flex items-start">
                    <div className="bg-gray-200 rounded-full w-6 h-6 flex-shrink-0 mr-2"></div>
                    <Skeleton className="h-4 w-10/12" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {facts.length > 0 ? (
                  facts.map((fact, index) => (
                    <div key={index} className="flex items-start">
                      <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center mr-2 shrink-0 font-medium text-sm">
                        {index + 1}
                      </span>
                      <p className="text-gray-700">{fact}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center italic">
                    No facts available
                  </p>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              onClick={() => setFactsDialogOpen(false)}
              className="w-full sm:w-auto"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GlobeWeather;
