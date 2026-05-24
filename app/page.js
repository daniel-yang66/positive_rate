import GeneralInfo from "./components/GeneralInfo";
import Traffic from "./components/Traffic";
import Performance from "./components/Performance";
import Weather from "./components/Weather";
import Map from "./components/Map";
import { redirect } from "next/navigation";
import AeroData from "./api/AeroData";
import AirportWeather from "./api/AirportWeather";
import AirportForecast from "./api/AirportTaf";
import tz_lookup from "tz-lookup";
import { Suspense } from "react";
import Loading from "./components/Loading";
import Default from "./components/Default";
export default async function Home({ searchParams }) {
  const params = await searchParams;
  const airport = await params.airport;
  const auth = await params.auth;
  const refresh = await params.refresh;

  if (auth === "false" || !auth) {
    redirect("/authentication");
  }

  if (airport) {
    try {
      const flights = await AeroData(airport.split(",")[0]);
      const weather = await AirportWeather(airport.split(",")[0]);
      const forecast = await AirportForecast(airport.split(",")[0]);
      const tz = tz_lookup(airport.split(",")[1], airport.split(",")[2]);

      return (
        <Suspense fallback={<Loading />} key={flights}>
          <div className="h-[90vh] w-[97vw] grid md:flex gap-[2vw]">
            <div className="h-[44vh] md:h-full z-[2] overflow-auto flex flex-col gap-[2vh] mt-[2vh] md:mt-0">
              <GeneralInfo info={weather} tz={tz} refreshStatus={refresh} />
              <Weather wx={weather} forecast={forecast} tz={tz} />
              <Traffic tz={tz} aero={flights} />
              <Performance aero={flights} />
            </div>

            <div className="relative">
              <Map air={airport} aero={flights} />
            </div>
          </div>
        </Suspense>
      );
    } catch {
      return <Default text={"Failed to get Airport Stats"} />;
    }
  } else {
    return <Default text={"Positive Rate, Gear Up"} />;
  }
}

export const generateMetadata = async ({ searchParams }) => {
  const { airportCode } = await searchParams;
  const title = airportCode ? `${airportCode} | +Rate` : "+Rate";

  return {
    title: title,
  };
};
