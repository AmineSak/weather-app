// pages/index.js

import Head from "next/head";
import GlobeWeather from "@/components/GlobeWeather";

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
      <main>
        <GlobeWeather />
      </main>
    </div>
  );
}
