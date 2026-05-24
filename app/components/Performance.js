"use client";
import { LuClockAlert, LuPlaneLanding, LuPlaneTakeoff } from "react-icons/lu";
import { AgCharts } from "ag-charts-react";
import { useEffect, useState, useRef } from "react";
import { DateTime } from "luxon";

export default function Performance({ aero }) {
  const [departures, setDepartures] = useState();
  const [arrivals, setArrivals] = useState();
  const [airline, setAirline] = useState("all");
  const [airlines, setAirlines] = useState();
  const [arrData, setArrData] = useState();
  const [depData, setDepData] = useState();
  const totalDelayTimeDep = useRef(0);
  const totalDelayTimeArr = useRef(0);

  useEffect(() => {
    if (!aero) return;
    const depAirlines = aero.departures.map((flt) => {
      return flt.airline
        ? flt.airline.name.replace("Airlines", "").trim()
        : "N/A";
    });
    const arrAirlines = aero.arrivals.map((flt) => {
      return flt.airline
        ? flt.airline.name.replace("Airlines", "").trim()
        : "N/A";
    });
    setDepartures(aero ? aero.departures : null);
    setArrivals(aero ? aero.arrivals : null);

    setAirlines([...new Set([...depAirlines, ...arrAirlines])].sort());
  }, [aero]);

  useEffect(() => {
    if (!departures && !arrivals) return;
    for (let i = 0; i < 2; i++) {
      const flights = i === 0 ? departures : arrivals;
      if (flights.length > 0) {
        i === 0
          ? (totalDelayTimeDep.current = 0)
          : (totalDelayTimeArr.current = 0);

        let otObj = { status: "On Time", flights: 0 };
        let shortDelObj = { status: "Delay <= 30m", flights: 0 };
        let longDelObj = { status: "Delay > 30m", flights: 0 };
        let cancelObj = { status: "Canceled", flights: 0 };

        flights.forEach((flt) => {
          if (flt.status.toLowerCase().includes("cancel")) {
            cancelObj.flights += 1;
          } else if (
            flt.movement.revisedTime &&
            flt.movement.scheduledTime &&
            (airline !== "all"
              ? flt.airline &&
                flt.airline.name &&
                flt.airline.name.replace("Airlines", "").trim() === airline
              : true)
          ) {
            const actTime = DateTime.fromISO(
              flt.movement.revisedTime.utc
                .replace(" ", "T")
                .replace("Z", ":00Z"),
            ).setZone("UTC");
            const schTime = DateTime.fromISO(
              flt.movement.scheduledTime.utc
                .replace(" ", "T")
                .replace("Z", ":00Z"),
            ).setZone("UTC");

            if (
              DateTime.now().setZone("UTC").plus({ hours: -2 }) <= actTime &&
              actTime <= DateTime.now().setZone("UTC")
            ) {
              i === 0
                ? (totalDelayTimeDep.current += Math.round(
                    actTime.diff(schTime) / 60000 > 0
                      ? actTime.diff(schTime) / 60000
                      : 0.1,
                  ))
                : (totalDelayTimeArr.current += Math.round(
                    actTime.diff(schTime) / 60000 > 0
                      ? actTime.diff(schTime) / 60000
                      : 0.1,
                  ));

              if (Math.round(actTime.diff(schTime) / 60000) <= 0)
                otObj.flights += 1;
              else if (
                Math.round(actTime.diff(schTime) / 60000) > 0 &&
                Math.round(actTime.diff(schTime) / 60000) <= 30
              )
                shortDelObj.flights += 1;
              else longDelObj.flights += 1;
            }
          }
        });
        i === 0
          ? setDepData([otObj, shortDelObj, longDelObj, cancelObj])
          : setArrData([otObj, shortDelObj, longDelObj, cancelObj]);
      }
    }
  }, [airline, departures, arrivals]);

  const myTheme = {
    palette: {
      fills: ["green", "yellow", "orange", "red"],
    },
  };
  const depOptions = {
    theme: myTheme,
    data: depData,

    background: {
      visible: false,
    },

    series: [
      {
        type: "donut",
        calloutLabel: {
          enabled: false,
        },
        calloutLabelKey: "status",
        angleKey: "flights",
        innerRadiusRatio: 0.6,
        innerLabels: [
          {
            text: "DEP",
            fontWeight: "bold",
            color: "#0096FF",
          },
        ],
      },
    ],
    legend: {
      enabled: false,
    },
    overlays: {
      loading: {
        text: "Loading...",
      },
      noData: {
        text: "No Data",
      },
      noVisibleSeries: {
        text: "",
      },
      unsupportedBrowser: {
        text: "",
      },
    },
  };

  const arrOptions = {
    theme: myTheme,
    data: arrData,

    background: {
      visible: false,
    },

    series: [
      {
        type: "donut",
        calloutLabel: {
          enabled: false,
        },
        calloutLabelKey: "status",
        angleKey: "flights",
        innerRadiusRatio: 0.6,
        innerLabels: [
          {
            text: "ARR",
            fontWeight: "bold",
            color: "#FFAC1C",
          },
        ],
      },
    ],
    legend: {
      enabled: false,
    },
    overlays: {
      loading: {
        text: "Loading...",
      },
      noData: {
        text: "No Data",
      },
      noVisibleSeries: {
        text: "",
      },
      unsupportedBrowser: {
        text: "",
      },
    },
  };

  return (
    <section className="relative flex-none font-semibold w-[96%] h-[17vh] md:h-[20vh] bg-slate-700 rounded-lg text-slate-200 p-2">
      <div className="gap-1 flex items-center absolute top-1 left-1 w-full">
        <LuClockAlert className="text-slate-400 text-[30px]" />
        <h2 className="text-lg text-slate-300 font-bold">Delays (2h)</h2>
      </div>
      <div className="grid gap-1 absolute top-1 right-1 items-center justify-items-center">
        <select
          onChange={(e) => setAirline(e.target.value)}
          className="w-18 h-6 rounded-lg bg-slate-400 text-slate-950 text-sm"
        >
          <option value={"all"}>Airline</option>
          {airlines ? (
            airlines.map((air, i) => {
              return (
                <option value={air} key={i}>
                  {air}
                </option>
              );
            })
          ) : (
            <></>
          )}
        </select>
      </div>
      <div className="flex gap-6 md:gap-0 items-center mt-[2%] w-full">
        <div className="flex items-center relative h-[18vh] overflow-hidden -ml-4 md:ml-0">
          <AgCharts
            options={depOptions}
            style={{ maxWidth: "25%", height: "100%", minWidth: "25%" }}
          />
          <div className="flex gap-2">
            <div className="inline-flex items-baseline gap-1">
              <LuPlaneTakeoff className="text-[25px] md:text-[30px] text-blue-400" />
              <p className="text-sm text-blue-400">avg</p>
            </div>
            <div className="inline-flex items-baseline">
              <p className="text-md md:text-lg">
                {depData &&
                depData.length === 4 &&
                depData[1].flights + depData[2].flights !== 0
                  ? Math.round(
                      totalDelayTimeDep.current /
                        (depData[1].flights + depData[2].flights),
                    )
                  : "--"}
              </p>
              <p className="text-sm">m</p>
            </div>
          </div>
          <AgCharts
            options={arrOptions}
            style={{ maxWidth: "25%", height: "100%", minWidth: "25%" }}
          />
          <div className="flex gap-2">
            <div className="inline-flex items-baseline gap-1">
              <LuPlaneLanding className="text-[25px] md:text-[30px] text-yellow-600" />
              <p className="text-sm text-yellow-600">avg</p>
            </div>{" "}
            <div className="inline-flex items-baseline">
              <p className="text-md md:text-lg">
                {arrData &&
                arrData.length === 4 &&
                arrData[1].flights + arrData[2].flights !== 0
                  ? Math.round(
                      totalDelayTimeArr.current /
                        (arrData[1].flights + arrData[2].flights),
                    )
                  : "--"}
              </p>
              <p className="text-sm">m</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
