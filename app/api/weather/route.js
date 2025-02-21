// app/api/weather/route.js
import { NextResponse } from "next/server";

export async function GET(request) {
  const searchParams = request.nextUrl.searchParams;
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  if (!lat || !lon) {
    return NextResponse.json(
      { error: "Latitude and longitude are required" },
      { status: 400 }
    );
  }

  const apiKey = process.env.WEATHERSTACK_API_KEY;
  const query = `${lat},${lon}`;
  const url = `http://api.weatherstack.com/current?access_key=${apiKey}&query=${query}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      console.error("Weatherstack API error:", data.error);
      return NextResponse.json({ error: data.error }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to fetch weather data:", error);
    return NextResponse.json(
      { error: "Failed to fetch weather data" },
      { status: 500 }
    );
  }
}
