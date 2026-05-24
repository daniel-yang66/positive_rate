"use client";
import { useState, useEffect, useRef } from "react";
import "../globals.css";
import { PiAirplaneInFlightFill } from "react-icons/pi";
import { DateTime } from "luxon";
import tz_lookup from "tz-lookup";
import clsx from "clsx";
import ConvertWeather from "../commonFunctions.js/ConvertWeather";
import Loading from "./Loading";
import FlightMap from "./FlightMap";
import { Query } from "appwrite";
import { tablesDB } from "../lib/appwrite";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { notify } from "../commonFunctions.js/Toast";
import { getUser } from "../lib/appwrite";
export default function FlightStatus({ flights, depWx, arrWx, refreshStatus }) {
  const [flight, setFlight] = useState();
  const [time, setTime] = useState({ dep: "--:--", arr: "--:--" });
  const [depType, setDepType] = useState("sch");
  const [arrType, setArrType] = useState("sch");
  const [depStatus, setDepStatus] = useState();
  const [arrStatus, setArrStatus] = useState();
  const [times, setTimes] = useState({ dep: "--:--", arr: "--:--" });
  const [progress, setProgress] = useState({ pct: 0, rem: "--", dur: "--" });
  const [weather, setWeather] = useState();
  const [text, setText] = useState("loading");
  const [logo, setLogo] = useState("");
  const [pathLength, setPathLength] = useState(0);
  const lastUpdate = useRef(Date.now());
  const searchParams = useSearchParams();
  const { replace } = useRouter();
  const pathName = usePathname();
  const pathRef = useRef(null);

  function UpdateInfo(text) {
    const params = new URLSearchParams(searchParams);
    text === "1" ? params.set("refresh", "0") : params.set("refresh", "1");
    replace(`${pathName}?${params.toString()}`);
  }

  async function getAirlineLogo(code) {
    try {
      const data = await tablesDB.listRows({
        databaseId: process.env.NEXT_PUBLIC_DATABASE_ID,
        tableId: process.env.NEXT_PUBLIC_TABLE_ID_4,
        queries: [Query.limit(1), Query.equal("iata", code)],
      });
      setLogo(data["rows"]);
    } catch {
      notify("Failed to get airline logos", "err");
    }
  }

  useEffect(() => {
    setFlight(flights && flights[0] ? flights[0] : null);
    setText(flights && flights[0] ? "done" : "No Flights Found");
  }, [flights]);

  useEffect(() => {
    getUser();
  }, []);

  useEffect(() => {
    if (!depWx || !arrWx) return;
    const depTz = tz_lookup(depWx.info.latitude, depWx.info.longitude);
    const arrTz = tz_lookup(arrWx.info.latitude, arrWx.info.longitude);
    const interval = setInterval(() => {
      if ((Date.now() - lastUpdate.current) / 1000 >= 300) {
        UpdateInfo(refreshStatus);
        lastUpdate.current = Date.now();
      }
      const oTime = DateTime.now().setZone(depTz);
      const deTime = DateTime.now().setZone(arrTz);
      setTimes({
        dep: `${String(oTime.hour).padStart(2, "0")}:${String(
          oTime.minute,
        ).padStart(2, "0")}`,
        arr: `${String(deTime.hour).padStart(2, "0")}:${String(
          deTime.minute,
        ).padStart(2, "0")}`,
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [depWx, arrWx]);

  useEffect(() => {
    if (!depWx || !arrWx) return;
    setWeather({
      dep: ConvertWeather(
        depWx.clouds,
        depWx.wx_codes,
        depWx,
        tz_lookup(depWx.info.latitude, depWx.info.longitude),
      ),
      arr: ConvertWeather(
        arrWx.clouds,
        arrWx.wx_codes,
        arrWx,
        tz_lookup(arrWx.info.latitude, arrWx.info.longitude),
      ),
    });
  }, [depWx, arrWx]);

  useEffect(() => {
    if (!flight) return;
    if (pathRef.current) {
      setPathLength(pathRef.current.getTotalLength());
    }
    getAirlineLogo(flight.airline_iata);
  }, [flight]);

  useEffect(() => {
    if (!flight) return;
    const destTz = tz_lookup(arrWx.info.latitude, arrWx.info.longitude);
    const orgTz = tz_lookup(depWx.info.latitude, depWx.info.longitude);
    const interval = setInterval(() => {
      let dTime;
      let aTime;

      if (flight.dep_actual_utc) {
        dTime = DateTime.fromISO(
          flight.dep_actual_utc.replace(" ", "T") + ":00Z",
        ).setZone(orgTz);
        setDepType("act");
      } else if (flight.dep_estimated_utc) {
        dTime = DateTime.fromISO(
          flight.dep_estimated_utc.replace(" ", "T") + ":00Z",
        ).setZone(orgTz);
        setDepType("est");
      } else if (flight.dep_time_utc) {
        dTime = DateTime.fromISO(
          flight.dep_time_utc.replace(" ", "T") + ":00Z",
        ).setZone(orgTz);
      }

      if (flight.arr_actual_utc) {
        aTime = DateTime.fromISO(
          flight.arr_actual_utc.replace(" ", "T") + ":00Z",
        ).setZone(destTz);
        setArrType("act");
      } else if (flight.arr_estimated_utc) {
        aTime = DateTime.fromISO(
          flight.arr_estimated_utc.replace(" ", "T") + ":00Z",
        ).setZone(destTz);
        setArrType("est");
      } else if (flight.arr_time_utc) {
        aTime = DateTime.fromISO(
          flight.arr_time_utc.replace(" ", "T") + ":00Z",
        ).setZone(destTz);
      }
      if (
        dTime &&
        dTime >
          DateTime.fromISO(
            flight.dep_time_utc.replace(" ", "T") + ":00Z",
          ).setZone(orgTz)
      )
        setDepStatus("late");
      else if (
        dTime &&
        dTime <=
          DateTime.fromISO(
            flight.dep_time_utc.replace(" ", "T") + ":00Z",
          ).setZone(orgTz)
      )
        setDepStatus("ot");
      else setDepStatus(null);

      if (
        aTime &&
        aTime >
          DateTime.fromISO(
            flight.arr_time_utc.replace(" ", "T") + ":00Z",
          ).setZone(destTz)
      )
        setArrStatus("late");
      else if (
        aTime &&
        aTime <=
          DateTime.fromISO(
            flight.arr_time_utc.replace(" ", "T") + ":00Z",
          ).setZone(destTz)
      )
        setArrStatus("ot");
      else setArrStatus(null);

      const totalTime = aTime.setZone("UTC").diff(dTime.setZone("UTC")) / 60000;

      const rem =
        aTime.setZone("UTC").diff(DateTime.now().setZone("UTC")) / 60000 >= 0
          ? aTime.setZone("UTC").diff(DateTime.now().setZone("UTC")) / 60000
          : 0;

      const pct = Math.min(
        100,
        Math.max(0, Math.round((1 - rem / totalTime) * 100)),
      );
      const durHour = Math.floor(flight.duration / 60);
      const durMin = Math.floor(flight.duration - durHour * 60);
      const remHour = Math.floor(rem / 60);
      const remMin = Math.floor(rem - remHour * 60);

      dTime = dTime
        ? `${String(dTime.hour).padStart(2, "0")}:${String(
            dTime.minute,
          ).padStart(2, "0")}, ${String(dTime.month).padStart(2, "0")}/${String(
            dTime.day,
          ).padStart(2, "0")}`
        : null;
      aTime = aTime
        ? `${String(aTime.hour).padStart(2, "0")}:${String(
            aTime.minute,
          ).padStart(2, "0")}, ${String(aTime.month).padStart(2, "0")}/${String(
            aTime.day,
          ).padStart(2, "0")}`
        : null;
      setTime({ dep: dTime, arr: aTime });

      setProgress({
        pct: pct,
        rem: `${remHour ? remHour : "--"}h ${remMin ? remMin : "--"}m`,
        dur: `${durHour ? durHour : "--"}h ${durMin ? durMin : "--"}m`,
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [flight]);

  if (text === "done") {
    return (
      <div className="w-full grid justify-items-center">
        <FlightMap info={flight} depWx={depWx} arrWx={arrWx} />
        <section className="grid justify-items-center md:flex md:justify-center gap-2 md:gap-4 w-[98vw] h-[48vh] md:w-[75vw] md:h-[40vh] font-semibold text-slate-300">
          <div className="relative w-[97%] md:w-[35%] h-full grid justify-items-center items-center bg-linear-to-br from-slate-900 to-slate-800 rounded-lg">
            <div className="absolute -top-[3vh] md:top-1 left-2 flex gap-2 items-center">
              <span className="relative flex">
                <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              <h3 className="text-md">Active Flights</h3>
            </div>
            <div className="items-center w-[93%] h-[75%] overflow-auto">
              {flights.map((flt, i) => {
                return (
                  <div
                    className={`w-full h-10 rounded-lg bg-slate-600 mb-4 p-2 flex gap-2 items-center justify-center ${
                      flt.flight_iata === flight.flight_iata
                        ? "border-2 border-slate-200"
                        : ""
                    }`}
                    key={i}
                    onClick={() =>
                      setFlight(
                        flights.find(
                          (flt2) => flt2.flight_iata === flt.flight_iata,
                        ),
                      )
                    }
                  >
                    <p className="text-slate-300">{flt.flight_iata}</p> |
                    <p className="text-blue-400">{flt.status}</p> |
                    <p className="text-slate-400">{flt.aircraft_icao}</p>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="relative w-[97%] md:w-[60%] h-full grid items-start justify-items-center bg-linear-to-br from-slate-900 to-slate-700 rounded-lg overflow-auto">
            <p className="absolute top-1 left-1 text-md text-blue-300 font-bold">
              {flight.airline_name ? flight.airline_name : ""}
            </p>
            {logo.length > 0 ? (
              <img
                src={`${logo[0].logo}`}
                width={45}
                height={45}
                alt="Logo"
                className="rounded-tr-md rounded-bl-md absolute top-1 right-1"
              />
            ) : (
              <></>
            )}
            <section className="relative grid justify-items-center gap-2">
              <PiAirplaneInFlightFill className="text-blue-400 text-[30px] md:text-[35px] z-[35] mt-2" />
              <div className="w-[390px] flex justify-between md:mt-0">
                <div className="inline-flex items-top">
                  {weather ? weather.dep.symbol : <></>}
                  <p className="text-[12px]">{`${depWx.temperature.value}\xB0${depWx.units.temperature}`}</p>
                </div>
                <div className="inline-flex items-top">
                  {weather ? weather.arr.symbol : <></>}
                  <p className="text-[12px]">{`${arrWx.temperature.value}\xB0${arrWx.units.temperature}`}</p>
                </div>{" "}
              </div>

              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-[360px] h-[70px] -mt-[15%]"
              >
                <path
                  ref={pathRef}
                  d={"M10 60 Q170 3 330 60"}
                  fill="none"
                  stroke="oklch(92.9% 0.013 255.508)"
                  strokeWidth="3"
                  strokeDasharray="6 8"
                  strokeLinecap="round"
                />

                <path
                  d={"M10 60 Q170 3 330 60"}
                  fill="none"
                  stroke="oklch(84.5% 0.143 164.978)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={pathLength}
                  strokeDashoffset={
                    pathLength - (pathLength * progress.pct) / 100
                  }
                />
                <circle
                  cx={10}
                  cy={60}
                  r={7}
                  fill="oklch(70.7% 0.165 254.624)"
                />
                <circle
                  cx={330}
                  cy={60}
                  r={7}
                  fill="oklch(68.1% 0.162 75.834)"
                />
              </svg>

              <div className={`w-[360px] flex justify-between -mt-[2%]`}>
                <div className="grid gap-[2px] justify-items-start">
                  {/* <div className="rounded-full bg-blue-400 w-4 h-4"></div> */}
                  <p className="text-lg md:text-xl">
                    {flight.dep_iata ? flight.dep_iata : flight.dep_icao}
                  </p>
                  <div className="inline-flex items-baseline">
                    <p className="text-sm">{times.dep}</p>
                    <p className="text-xs text-slate-400 ml-[2px]">local</p>
                  </div>
                </div>
                <div className="grid justify-items-center h-[30px]">
                  <p className="text-[20px]">{progress.dur}</p>
                  <p className="text-[13px]">{progress.rem} left</p>
                </div>
                <div className="grid gap-[2px] justify-items-end">
                  {/* <div className="rounded-full bg-yellow-600 w-4 h-4"></div> */}
                  <p className=" text-lg md:text-xl">
                    {flight.arr_iata ? flight.arr_iata : flight.arr_icao}
                  </p>
                  <div className="inline-flex items-baseline">
                    <p className="text-sm">{times.arr}</p>
                    <p className="text-xs text-slate-400 ml-[2px]">local</p>
                  </div>
                </div>{" "}
              </div>
            </section>
            <section className="grid grid-cols-2 w-[93%] md:w-[80%] gap-2 text-sm md:text-md">
              <div className="w-full h-12 bg-slate-600 rounded-lg flex gap-2 items-center justify-center p-2">
                <div
                  className={clsx(`rounded-full w-2 h-2`, {
                    "bg-emerald-400": depStatus === "ot",
                    "bg-orange-400": depStatus === "late",
                    "bg-slate-300": !depStatus,
                  })}
                ></div>
                <div className="inline-flex items-baseline">
                  <p>{time.dep}</p>
                  <p className="text-sm text-slate-400 ml-[2px]">{depType}</p>
                </div>
              </div>
              <div className="w-full h-12 bg-slate-600 rounded-lg flex gap-2 items-center justify-center p-2">
                <div
                  className={clsx(`rounded-full w-2 h-2`, {
                    "bg-emerald-400": arrStatus === "ot",
                    "bg-orange-400": arrStatus === "late",
                    "bg-slate-300": !arrStatus,
                  })}
                ></div>
                <div className="inline-flex items-baseline">
                  <p>{time.arr}</p>
                  <p className="text-sm text-slate-400 ml-[2px]">{arrType}</p>
                </div>
              </div>{" "}
              <div className="w-full h-12 bg-slate-600 rounded-lg p-2 flex items-center justify-center">
                {`Terminal ${
                  flight.dep_terminal ? flight.dep_terminal : "--"
                }, ${flight.dep_gate ? flight.dep_gate : "--"}`}
              </div>
              <div className="w-full h-12 bg-slate-600 rounded-lg p-2 grid items-center justify-items-center">
                {`Terminal ${
                  flight.arr_terminal ? flight.arr_terminal : "--"
                }, ${flight.arr_gate ? flight.arr_gate : "--"}`}
              </div>
            </section>
          </div>
        </section>
      </div>
    );
  } else if (text === "No Flights Found") {
    return (
      <h1 className="text-[40px] grid self-center justify-self-center font-bold text-slate-300">
        No Flights Found
      </h1>
    );
  } else {
    return <Loading />;
  }
}
