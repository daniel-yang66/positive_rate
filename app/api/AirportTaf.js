"use server";
export default async function AirportForecast(airport) {
  const avwxKey = process.env.AVWX_TOKEN;
  let data;
  const res = await fetch(
    `https://avwx.rest/api/taf/${airport}?&airport=true&reporting=true&format=json&onfail=cache&token=${avwxKey}`
  );
  data = await res.json();

  return data;
}
