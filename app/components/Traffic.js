"use client";

import { AgCharts } from "ag-charts-react";
import { useState, useEffect } from "react";
import { LuTowerControl } from "react-icons/lu";
import { DateTime } from "luxon";

export default function Traffic({ tz, aero }) {
  const [departures, setDepartures] = useState(aero ? aero.departures : null);
  const [arrivals, setArrivals] = useState(aero ? aero.arrivals : null);
  const [airlines, setAirlines] = useState();
  const [airline, setAirline] = useState("all");
  const [data, setData] = useState();

  function getTraffic() {
    const depAirlines = departures.map((flt) => {
      return flt.airline
        ? flt.airline.name.replace("Airlines", "").trim()
        : "N/A";
    });
    const arrAirlines = arrivals.map((flt) => {
      return flt.airline
        ? flt.airline.name.replace("Airlines", "").trim()
        : "N/A";
    });
    setDepartures(aero ? aero.departures : null);
    setArrivals(aero ? aero.arrivals : null);

    setAirlines([...new Set([...depAirlines, ...arrAirlines])].sort());
  }

  useEffect(() => {
    if (!aero) return;
    getTraffic();
  }, [aero]);

  useEffect(() => {
    if (!departures || !arrivals) return;

    let distinctTimes = [];
    for (let i = -2; i < 12; i++) {
      const time = DateTime.now().setZone(tz).plus({ hours: i });
      const timeFormatted = `${time.year}/${String(time.month).padStart(
        2,
        "0",
      )}/${String(time.day).padStart(2, "0")} ${String(time.hour).padStart(
        2,
        "0",
      )}`;
      distinctTimes.push(timeFormatted);
    }

    let dataLst = [];
    distinctTimes.forEach((t) => {
      let fltObj = {};
      const relevantDepartures = departures.filter((flt) => {
        const time = DateTime.fromISO(
          String(
            flt.movement.revisedTime
              ? flt.movement.revisedTime.utc
              : flt.movement.scheduledTime.utc,
          )
            .replace(" ", "T")
            .replace("Z", ":00Z"),
          { zone: tz },
        );
        return airline === "all"
          ? `${time.year}/${String(time.month).padStart(2, "0")}/${String(
              time.day,
            ).padStart(2, "0")} ${String(time.hour).padStart(2, "0")}` === t &&
              !flt.status.toLowerCase().includes("cancel")
          : `${time.year}/${String(time.month).padStart(2, "0")}/${String(
              time.day,
            ).padStart(2, "0")} ${String(time.hour).padStart(2, "0")}` === t &&
              flt.airline.name.replace("Airlines", "").trim() === airline &&
              !flt.status.toLowerCase().includes("cancel");
      });

      const relevantArrivals = arrivals.filter((flt) => {
        const time = DateTime.fromISO(
          String(
            flt.movement.revisedTime
              ? flt.movement.revisedTime.utc
              : flt.movement.scheduledTime.utc,
          )
            .replace(" ", "T")
            .replace("Z", ":00Z"),
          { zone: tz },
        );

        return airline === "all"
          ? `${time.year}/${String(time.month).padStart(2, "0")}/${String(
              time.day,
            ).padStart(2, "0")} ${String(time.hour).padStart(2, "0")}` === t &&
              !flt.status.toLowerCase().includes("cancel")
          : `${time.year}/${String(time.month).padStart(2, "0")}/${String(
              time.day,
            ).padStart(2, "0")} ${String(time.hour).padStart(2, "0")}` === t &&
              flt.airline.name.replace("Airlines", "").trim() === airline &&
              !flt.status.toLowerCase().includes("cancel");
      });
      fltObj.time = t;
      fltObj.departures = relevantDepartures.length;
      fltObj.arrivals = relevantArrivals.length;
      dataLst.push(fltObj);
    });
    setData(dataLst);
  }, [airline, departures, arrivals]);

  const myTheme = {
    palette: {
      fills: ["#60A5FA", "#CA8A04"],
    },
  };

  const options = {
    theme: myTheme,
    data: data,
    background: {
      visible: false,
    },

    series: [
      {
        type: "bar",
        xKey: "time",
        yKey: "departures",
        yName: "Departures",
        stacked: true,
        cornerRadius: 12,
      },
      {
        type: "bar",
        xKey: "time",
        yKey: "arrivals",
        yName: "Arrivals",
        stacked: true,
        cornerRadius: 12,
      },
    ],
    axes: [
      {
        type: "category",
        position: "bottom",
        label: {
          color: "white",
          formatter: ({ value }) => {
            return value.slice(-2);
          },
        },
      },
      {
        type: "number",
        position: "left",
        label: {
          color: "white",
        },

        gridLine: {
          enabled: false,
        },
        interval: { minSpacing: 15, maxSpacing: 35 },
      },
    ],
    legend: {
      position: "top",
      item: {
        label: {
          color: "white",
        },
        marker: {
          size: 8,

          shape: "circle", // 'circle', 'square', 'cross', 'plus', 'triangle'
        },
      },
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
    <section className="relative flex-none grid items-end justify-items-center gap-1 font-semibold w-[96%] h-[26vh] md:h-[29vh] bg-slate-700 rounded-lg text-slate-200 p-2 mt-2">
      <div className="flex gap-1 items-center absolute top-1 left-1 w-full">
        <LuTowerControl className="text-slate-400 text-[30px]" />
        <h2 className="text-lg md:text-xl text-slate-300 font-bold">Traffic</h2>
      </div>
      <AgCharts options={options} style={{ height: "26vh", width: "105%" }} />
      <div className="grid absolute top-1 right-1 gap-2 ">
        <select
          onChange={(e) => setAirline(e.target.value)}
          className=" grid items-center justify-items-center w-18 md:w-20 md:h-6 rounded-lg bg-slate-400 text-slate-950"
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
    </section>
  );
}
