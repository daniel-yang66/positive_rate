"use server";
export default async function AirportWeather(airport) {
  const avwxKey = process.env.AVWX_TOKEN;
  let data;
  const res = await fetch(
    `https://avwx.rest/api/metar/${airport}?options=info,translate&airport=true&reporting=true&format=json&onfail=cache&token=${avwxKey}`
  );
  data = await res.json();

  return data;
}
