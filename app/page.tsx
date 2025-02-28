// pages/index.js

import Head from "next/head";
import GlobeWeather from "@/components/GlobeWeather";
import SearchWeather from "@/components/SearchWeather";

export default function Home() {
  return (
    <div>
      <Head>
        <title>Weather Globe</title>
        <meta
          name="description"
          content="Interactive globe with real-time weather data"
        />
      </Head>
      <header className="fixed top-0 left-0 w-full bg-gray-500 text-white p-2 shadow-lg z-10">
        <div className="max-w-screen-xl mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold">Weather Globe</h1>
          <SearchWeather />
        </div>
      </header>
      <main className="pt-90"> {/* Ajuster le padding-top pour compenser la hauteur de la barre de navigation */}
        <h1 className="text-white text-5xl font-extrabold mb-4 font-serif text-center">
          Weather Globe Interactive
        </h1>
        <GlobeWeather />
      </main>
    </div>
  );
}
