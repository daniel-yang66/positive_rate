"use server";
export default async function AeroData(airport) {
  const res = await fetch(
    `https://aerodatabox.p.rapidapi.com/flights/airports/icao/${airport}?offsetMinutes=-120&durationMinutes=720&withLeg=false&direction=Both&withCancelled=true&withCodeshared=false&withCargo=true&withPrivate=true&withLocation=false`,
    {
      method: "GET",
      headers: {
        "x-rapidapi-key": process.env.AERO_KEY,
        "x-rapidapi-host": "aerodatabox.p.rapidapi.com",
      },
    },
  );

  const data = await res.json();

  return data;
}
