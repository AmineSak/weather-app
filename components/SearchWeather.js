"use client";

import React, { useState } from "react";

const SearchWeather = () => {
  const [lat, setLat] = useState("");
  const [lon, setLon] = useState("");
  const [weather, setWeather] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState(""); 

  const fetchWeather = async () => {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);

    if (!lat || !lon) {
      console.error("Latitude and longitude are required");
      return;
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      setErrorMessage("Veuillez rentrer une valeur de latitude entre -90 et 90 et une longitude entre -180 et 180.");
      setShowPopup(true); // Afficher le pop-up d'erreur
      return;
    }

    setErrorMessage(""); 
    setShowPopup(false);  

    try {
      const res = await fetch(`/api/weather?lat=${latitude}&lon=${longitude}`);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      // Vérification des données : si aucune donnée valide n'est retournée
      if (!data || !data.location || !data.current) {
        setErrorMessage("Aucune donnée disponible pour ces coordonnées.");
        setShowPopup(true); // Affiche le pop-up d'erreur si aucune donnée n'est trouvée
        return;
      }

      setWeather(data);
      setShowPopup(true); 
    } catch (error) {
      console.error("Error fetching weather:", error);
      setErrorMessage("Aucune donnée disponible pour ces coordonnées.");
      setShowPopup(true); // Affiche aussi le pop-up d'erreur en cas d'erreur dans la requête
    }
  };

  return (
    <div className="flex items-center space-x-4">
      <input
        type="number"
        placeholder="Latitude"
        value={lat}
        onChange={(e) => setLat(e.target.value)}
        className="p-1 border w-24 border-gray-300 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <input
        type="number"
        placeholder="Longitude"
        value={lon}
        onChange={(e) => setLon(e.target.value)}
        className="p-1 border w-24 border-gray-300 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        onClick={fetchWeather}
        className="p-1 bg-green-500 text-white hover:bg-green-700 focus:outline-none"
      >
        Search
      </button>

      {showPopup && (errorMessage || weather) && (
  <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50">
    <div className="bg-white p-6 shadow-lg max-w-sm rounded-lg"> 
      {errorMessage ? (
        <div className="text-red-600">
          <h2 className="text-xl text-black font-bold">Erreur</h2>
          <p>{errorMessage}</p>
        </div>
      ) : (
        <>
          <h2 className="text-xl text-black font-bold">{weather.location.name}</h2>
          <h3 className="text-lg text-black font-semibold">Weather Information</h3>
          <p className="text-black"><strong>Temperature:</strong> {weather.current.temperature}°C</p>
          <p className="text-black"><strong>Conditions:</strong> {weather.current.weather_descriptions.join(", ")}</p>
          <p className="text-black"><strong>Humidity:</strong> {weather.current.humidity}%</p>
          <p className="text-black"><strong>Wind Speed:</strong> {weather.current.wind_speed} km/h</p>
        </>
      )}
      <button
        onClick={() => setShowPopup(false)}
        className="mt-4 p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700" 
      >
        Close
      </button>
    </div>
  </div>
)}
    </div>
  );
};

export default SearchWeather;
