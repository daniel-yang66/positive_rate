import { redirect } from "next/navigation";
import FlightStatus from "../components/FlightStatus";
import RealTime from "../api/AirLab";
import AirportWeather from "../api/AirportWeather";
import { Suspense } from "react";
import Loading from "../components/Loading";
import Default from "../components/Default";
export default async function FlightPage({ searchParams }) {
  const params = await searchParams;
  const auth = await params.auth;
  const route = await params.route;
  const flightNo = await params.flightno;
  const refreshStatus = await params.refresh;
  if (auth === "false" || !auth) {
    redirect("/authentication");
  }
  if (route || flightNo) {
    try {
      const flightData = route
        ? await RealTime(route.split(",")[0], route.split(",")[1], null)
        : await RealTime(null, null, flightNo);

      const depWeather = route
        ? await AirportWeather(route.split(",")[0])
        : flightData.length > 0
        ? await AirportWeather(flightData[0].dep_icao)
        : null;
      const arrWeather = route
        ? await AirportWeather(route.split(",")[1])
        : flightData.length > 0
        ? await AirportWeather(flightData[0].arr_icao)
        : null;

      return (
        <Suspense fallback={<Loading />}>
          <FlightStatus
            flights={flightData}
            depWx={depWeather}
            arrWx={arrWeather}
            refreshStatus={refreshStatus}
          />
        </Suspense>
      );
    } catch {
      return <Default text={"Failed to get flight data"} />;
    }
  } else {
    return <Default text={"Positive Rate, Gear Up"} />;
  }
}

export const generateMetadata = () => {
  return { title: `Flight Tracking | +Rate` };
};
