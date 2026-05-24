"use client";
import { useState, useEffect, useRef } from "react";
import {
  LuChevronUp,
  LuPlane,
  LuPlaneLanding,
  LuPlaneTakeoff,
  LuTally2,
  LuTowerControl,
} from "react-icons/lu";
import { DateTime } from "luxon";
import { motion } from "framer-motion";
import { tablesDB } from "../lib/appwrite";
import { Query } from "appwrite";
import Loading from "./Loading";
import { notify } from "../commonFunctions.js/Toast";

export default function Flights({ aero }) {
  const [collapse, setCollapse] = useState(true);
  const [type, setType] = useState("dep");
  const [counter, setCounter] = useState(0);
  const [value, setValue] = useState("");
  const [airlineLogos, setAirlineLogos] = useState([]);
  const [loading, setLoading] = useState(false);

  const colorMap = useRef({
    slate: "bg-slate-300",
    green: "bg-emerald-300",
    orange: "bg-orange-200",
    red: "bg-red-400",
  });

  async function getAirlineLogos(lst) {
    setLoading(true);
    try {
      const data = await tablesDB.listRows({
        databaseId: process.env.NEXT_PUBLIC_DATABASE_ID,
        tableId: process.env.NEXT_PUBLIC_TABLE_ID_4,
        queries: [Query.limit(lst.length), Query.equal("iata", lst)],
      });
      setAirlineLogos(data["rows"]);
    } catch {
      notify("Failed to get airline logos", "err");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let airline_lst = [];

    const flights = [...aero.arrivals, ...aero.departures];
    flights.forEach((flt, i) => {
      flt.airline && flt.airline.iata
        ? airline_lst.push(flt.airline.iata)
        : null;
    });

    const uniqueAirlines = [...new Set(airline_lst)];
    getAirlineLogos(uniqueAirlines);
  }, [aero]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!aero) return;
      setCounter((prev) => (prev === 2 ? 0 : prev + 1));
    }, 2000);

    return () => clearInterval(interval);
  }, [aero]);

  const getSliderPosition = () => {
    if (type) {
      return type === "dep" ? 0 : 1;
    }
  };

  if (!aero) return;

  if (!loading) {
    return (
      <section className="text-slate-200 font-semibold">
        <div
          onClick={() => {
            setCollapse(!collapse);
          }}
          className="flex text-slate-300 text-md absolute top-2 md:top-[3vh] z-10 left-1 font-bold"
        >
          <LuChevronUp
            className={`${
              collapse ? "" : "rotate-[180deg]"
            } text-[24px] font-bold`}
          />
          <p>{collapse ? "View Flights" : "Hide Flights"}</p>
        </div>
        <div
          className={`${
            !collapse ? "hidden" : "grid gap-[4px]"
          } text-slate-300 text-md absolute top-2 md:top-[3vh] z-10 right-1`}
        >
          <div className="flex gap-2 items-center">
            <div className="bg-blue-400 rounded-full w-2 h-2"></div>
            <p>Departures</p>
          </div>
          <div className="flex gap-2 items-center">
            <div className="bg-yellow-600 rounded-full w-2 h-2"></div>
            <p>Arrivals</p>
          </div>
          <div className="flex gap-2 items-center">
            <div className="bg-purple-400 rounded-full w-2 h-2"></div>
            <p>Both</p>
          </div>
        </div>

        <input
          onChange={(e) => {
            setValue(e.target.value.toUpperCase());
          }}
          value={value}
          placeholder="Search"
          className={`${
            collapse ? "hidden" : ""
          } rounded-lg w-[30vw] h-[4vh] md:w-[10vw] md:h-[5vh] bg-slate-400 p-2 text-slate-900 absolute md:top-[3vh] z-10 right-1`}
        />

        {(type === "dep" ? aero.departures : aero.arrivals) ? (
          <div
            className={`z-10 absolute top-[3vh] md:top-[5vh] left-1 ${
              collapse ? "invisible" : "grid items-center"
            } h-[39vh] w-[75vw] md:h-[80vh] md:w-[29vw]`}
          >
            <div
              className={`${
                collapse ? "hidden" : "flex gap-4"
              } items-center justify-self-center h-8 w-[75%] bg-slate-500 rounded-md relative`}
            >
              <motion.div
                className="absolute bg-slate-700 rounded-md shadow-sm w-1/2 h-full"
                initial={false}
                animate={{
                  x: getSliderPosition() * 100 + "%",
                  width: "50%",
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                }}
              />

              <div
                onClick={() => {
                  setType("dep");
                  setValue("");
                }}
                className="flex gap-1 justify-center items-center transition-colors duration-200 relative z-[10] w-1/2"
              >
                <LuPlaneTakeoff className="text-blue-400 text-[24px]" />
                <h2>Departures</h2>
              </div>
              <div
                onClick={() => {
                  setType("arr");
                  setValue("");
                }}
                className="flex gap-1 justify-center items-center transition-colors duration-200 relative z-[10] w-1/2"
              >
                <LuPlaneLanding className="text-yellow-600 text-[24px]" />
                <h2>Arrivals</h2>
              </div>
            </div>

            <div className="flex flex-col gap-2 overflow-auto h-[30vh] md:h-[70vh] w-[87vw] md:w-[35vw]">
              {(type === "dep" ? aero.departures : aero.arrivals)
                .filter((flt, i) => {
                  if (value.trim().length === 0) return true;
                  else if (
                    (flt.movement.airport &&
                      (flt.movement.airport.name ||
                        flt.movement.airport.icao ||
                        flt.movement.airport.iata)) ||
                    (flt.airline &&
                      (flt.airline.name ||
                        flt.airline.icao ||
                        flt.airline.iata))
                  ) {
                    return (
                      String(flt.movement.airport.name)
                        .toUpperCase()
                        .startsWith(value) ||
                      String(flt.movement.airport.icao)
                        .toUpperCase()
                        .startsWith(value) ||
                      String(flt.movement.airport.iata)
                        .toUpperCase()
                        .startsWith(value) ||
                      String(flt.number).toUpperCase().includes(value) ||
                      String(flt.airline.name)
                        .toUpperCase()
                        .startsWith(value) ||
                      String(flt.airline.icao)
                        .toUpperCase()
                        .startsWith(value) ||
                      String(flt.airline.iata).toUpperCase().startsWith(value)
                    );
                  }
                })
                .map((flt, i) => {
                  let depTime;
                  let depTimeSch;
                  let arrTime;
                  let arrTimeSch;
                  if (type === "dep") {
                    depTime =
                      flt.movement.revisedTime ||
                      flt.movement.scheduledTime ||
                      flt.movement.predictedTime
                        ? DateTime.fromISO(
                            String(
                              flt.movement.predictedTime
                                ? flt.movement.predictedTime.local
                                : flt.movement.revisedTime
                                  ? flt.movement.revisedTime.local
                                  : flt.movement.scheduledTime.local,
                            )
                              .replace(" ", "T")
                              .slice(0, 16) + ":00",
                          )
                        : "--:--";

                    depTimeSch = flt.movement.scheduledTime
                      ? DateTime.fromISO(
                          String(flt.movement.scheduledTime.local)
                            .replace(" ", "T")
                            .slice(0, 16) + ":00",
                        )
                      : "--:--";
                  }

                  if (type === "arr") {
                    arrTime =
                      flt.movement.revisedTime ||
                      flt.movement.scheduledTime ||
                      flt.movement.predictedTime
                        ? DateTime.fromISO(
                            String(
                              flt.movement.predictedTime
                                ? flt.movement.predictedTime.local
                                : flt.movement.revisedTime
                                  ? flt.movement.revisedTime.local
                                  : flt.movement.scheduledTime.local,
                            )
                              .replace(" ", "T")
                              .slice(0, 16) + ":00",
                          )
                        : "--:--";

                    arrTimeSch = flt.movement.scheduledTime
                      ? DateTime.fromISO(
                          String(flt.movement.scheduledTime.local)
                            .replace(" ", "T")
                            .slice(0, 16) + ":00",
                        )
                      : "--:--";
                  }

                  let onTimeColor;
                  let status = "--";

                  if (flt.status.toLowerCase().includes("cancel")) {
                    onTimeColor = "red";
                    status = "Canceled";
                  } else if (
                    type === "dep" &&
                    depTime !== "--:--" &&
                    depTimeSch !== "--:--"
                  ) {
                    onTimeColor = depTime > depTimeSch ? "orange" : "green";

                    const diff = Math.round(depTime.diff(depTimeSch) / 60000);
                    status =
                      diff <= 0
                        ? `Dep ${Math.abs(diff)}m early`
                        : `Dep ${Math.abs(diff)}m late`;
                  } else if (
                    type === "arr" &&
                    arrTime !== "--:--" &&
                    arrTimeSch !== "--:--"
                  ) {
                    onTimeColor = arrTime > arrTimeSch ? "orange" : "green";

                    const diff = Math.round(arrTime.diff(arrTimeSch) / 60000);
                    status =
                      diff <= 0
                        ? `Arr ${Math.abs(diff)}m early`
                        : `Arr ${Math.abs(diff)}m late`;
                  } else {
                    onTimeColor = "slate";
                  }
                  const alternateText = [
                    flt.number ? flt.number : "---",
                    flt.airline.name ? flt.airline.name : "---",
                    status,
                  ];

                  const currentTimeStamp = DateTime.now().setZone("UTC");
                  const currentTimeFormatted = `${
                    currentTimeStamp.year
                  }-${String(currentTimeStamp.month).padStart(2, "0")}-${String(
                    currentTimeStamp.day,
                  ).padStart(2, "0")} ${String(currentTimeStamp.hour).padStart(
                    2,
                    "0",
                  )}:${String(currentTimeStamp.minute).padStart(2, "0")}`;

                  const logo = airlineLogos.filter((logo) => {
                    return logo.iata === flt.airline.iata;
                  });

                  return (
                    <div
                      key={i}
                      className="relative flex-none grid items-center justify-items-center p-2 h-[13vh] md:h-[17vh] w-full rounded-md bg-slate-700"
                    >
                      <div className="absolute top-1 left-1">
                        <div className=" flex gap-1 items-center">
                          <div
                            className={`${colorMap.current[onTimeColor]} w-2 h-2 rounded-full`}
                          ></div>
                          <h2 className="transition-opacity duration-[3s] text-slate-300 font-bold">
                            {alternateText.slice(counter, counter + 1)}
                          </h2>
                        </div>
                        <div className="grid gap-1 mt-2">
                          {type === "dep" ? (
                            <div className="flex gap-2 items-center">
                              <LuPlaneTakeoff className="text-blue-400 text-[26px]" />
                              <div className="inline-flex items-baseline">
                                <p className="text-md">
                                  {depTime !== "--:--"
                                    ? `${String(depTime.hour).padStart(
                                        2,
                                        "0",
                                      )}:${String(depTime.minute).padStart(
                                        2,
                                        "0",
                                      )}`
                                    : depTime}
                                </p>
                                <p className="text-sm text-slate-400">
                                  {!flt.status.toLowerCase().includes("cancel")
                                    ? flt.movement.revisedTime
                                      ? flt.movement.revisedTime.utc.slice(
                                          0,
                                          16,
                                        ) > currentTimeFormatted
                                        ? "est"
                                        : "act"
                                      : "sch"
                                    : "sch"}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="flex gap-2 items-center">
                              <LuPlaneLanding className="text-yellow-600 text-[26px]" />
                              <div className="inline-flex items-baseline">
                                <p className="text-md">
                                  {arrTime !== "--:--"
                                    ? `${String(arrTime.hour).padStart(
                                        2,
                                        "0",
                                      )}:${String(arrTime.minute).padStart(
                                        2,
                                        "0",
                                      )}`
                                    : arrTime}
                                </p>
                                <p className="text-sm text-slate-400">
                                  {!flt.status.toLowerCase().includes("cancel")
                                    ? flt.movement.revisedTime
                                      ? flt.movement.revisedTime.utc.slice(
                                          0,
                                          16,
                                        ) > currentTimeFormatted
                                        ? "est"
                                        : "act"
                                      : "sch"
                                    : "sch"}
                                </p>
                              </div>
                            </div>
                          )}
                          <div className="flex items-center">
                            <LuTally2
                              className={`text-[26px] ${
                                type === "dep"
                                  ? "text-blue-400"
                                  : "text-yellow-600"
                              }`}
                            />
                            <p className="text-md">
                              {flt.movement.runway ? flt.movement.runway : "--"}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="absolute top-1 right-1 grid gap-1 justify-items-end">
                        {logo.length > 0 ? (
                          <img
                            src={`${logo[0].logo}`}
                            width={40}
                            height={40}
                            alt="Logo"
                            className="rounded-tr-md rounded-bl-md"
                          />
                        ) : (
                          <></>
                        )}
                      </div>
                      <div className="grid justify-items-center">
                        <h2 className="text-md">
                          {flt.movement.airport && flt.movement.airport.icao
                            ? `${flt.movement.airport.icao}${
                                flt.movement.airport.iata
                                  ? `/${flt.movement.airport.iata}`
                                  : ""
                              }`
                            : ""}
                        </h2>
                        <h2 className="text-sm">
                          {flt.movement.airport && flt.movement.airport.name
                            ? flt.movement.airport.name
                            : "---"}
                        </h2>
                      </div>
                      <div className="absolute bottom-1 left-2 flex gap-4">
                        <div className="flex gap-1 items-center">
                          <LuTowerControl className="text-[24px] text-slate-400" />
                          <p className="text-sm">
                            {`Term ${
                              flt.movement.terminal
                                ? flt.movement.terminal
                                : "--"
                            }, ${flt.movement.gate ? flt.movement.gate : "--"}`}
                          </p>
                        </div>
                        <div className="flex gap-1 items-center">
                          <LuPlane className="text-[24px] text-slate-400" />
                          <p className="text-sm">
                            {flt.aircraft ? flt.aircraft.model : "--"}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        ) : (
          <h2
            className={`${
              collapse ? "hidden" : ""
            } flex gap-1 text-slate-300 text-md absolute top-[5vh] md:top-[15vh] z-10 left-4`}
          >
            No Flights Found
          </h2>
        )}
      </section>
    );
  } else {
    return <Loading />;
  }
}
