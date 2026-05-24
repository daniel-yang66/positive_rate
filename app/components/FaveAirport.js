"use client";
import {
  LuCloud,
  LuWind,
  LuArrowUp,
  LuBinoculars,
  LuThermometer,
  LuTally2,
  LuMoveVertical,
} from "react-icons/lu";
import clsx from "clsx";
import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import Loading from "./Loading";
import ConvertWeather from "../commonFunctions.js/ConvertWeather";

export default function FaveAirport({ wx, tz }) {
  const { replace } = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  function HandleAirport(text) {
    const params = new URLSearchParams(searchParams);
    text ? params.set("airport", text) : params.delete("airport");
    replace(`/?${params.toString()}`);
  }

  const wxDerived = ConvertWeather(wx.clouds, wx.wx_codes, wx, tz);
  const symbol = wxDerived.symbol;
  const condition = wxDerived.condition;
  const ceiling = wxDerived.ceiling;
  const fr = wx.flight_rules;
  const temp = wx.temperature ? wx.temperature.value : "--";
  const vis = wx.visibility ? wx.visibility.value : "--";
  const ws =
    wx.wind_gust && wx.wind_speed
      ? `${wx.wind_speed.value}/${wx.wind_gust.value}`
      : wx.wind_speed
        ? wx.wind_speed.value
        : 0;
  const wd = wx.wind_direction ? wx.wind_direction.value + 180 : 0;

  if (!loading) {
    return (
      <div
        onClick={() => {
          setLoading(true);
          HandleAirport(
            `${wx.info.icao},${wx.info.latitude},${wx.info.longitude}`,
          );
        }}
        className="relative flex gap-4 items-end p-2 h-[15vh] md:h-[17vh] w-full md:w-[95%] md:min-w-[28vw] rounded-lg bg-slate-600 font-semibold overflow-auto"
      >
        <div className="absolute top-0 left-1 grid">
          <h2 className="text-lg font-bold text-blue-200">{`${wx.info.icao}${
            wx.info.iata ? `/${wx.info.iata}` : ""
          }`}</h2>
          <div className="flex items-center gap-4">
            <div className="flex gap-1 items-center">
              <LuMoveVertical className="text-green-400 text-md" />
              <div className="inline-flex items-baseline text-slate-200">
                <p className="text-md">{wx.info.elevation_ft}</p>
                <p className="text-sm">ft</p>
              </div>
            </div>

            <div className="flex gap-0 items-center">
              <LuTally2 className="text-blue-400 text-xl" />
              <h2 className="text-slate-200 text-md">
                {wx.info.runways.length}
              </h2>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-1 flex gap-2 items-center">
          <div
            className={clsx(`w-2 h-2 rounded-full`, {
              "bg-green-400": fr === "VFR",
              "bg-blue-400": fr === "MVFR",
              "bg-red-400": fr === "IFR",
              "bg-purple-400": fr === "LIFR",
            })}
          ></div>
          <h2 className="text-lg">{fr}</h2>
        </div>
        <div className="flex gap-6 items-center w-[98%]">
          <div className="flex gap-2 items-center self-center w-[36%] overflow-auto shrink-0">
            {symbol}
            <h2 className="text-lg">{condition}</h2>
          </div>
          <section className=" grid grid-cols-[auto_1fr] gap-2 items-center w-[56%] overflow-auto">
            <div className="flex gap-1 items-center">
              <LuThermometer className="text-red-300 text-[25px]" />
              <div className="inline-flex items-top">
                <p className="text-lg">{temp}</p>
                <p className="text-sm">{`\xB0${wx.units.temperature}`}</p>
              </div>
            </div>
            <div className="flex gap-2 items-center">
              <LuWind className="text-blue-300 text-[25px]" />
              <div className="inline-flex items-baseline">
                <p className="text-lg">{ws}</p>
                <p className="text-sm">{wx.units.wind_speed}</p>
              </div>
              <LuArrowUp
                style={{ rotate: `${wd}deg` }}
                className="text-slate-300 text-[20px]"
              />
            </div>
            <div className="flex gap-2 items-center">
              <LuCloud className="text-slate-400 text-[25px]" />
              <div className="inline-flex items-baseline">
                <p className="text-lg">{ceiling}</p>
                <p className="text-sm">{wx.units.altitude}</p>
              </div>
            </div>

            <div className="flex gap-2 items-center ml-2">
              <LuBinoculars className="text-emerald-300 text-[20px]" />
              <div className="inline-flex items-baseline">
                <p className="text-lg">{vis}</p>
                <p className="text-sm">{wx.units.visibility}</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    );
  } else {
    return <Loading />;
  }
}
