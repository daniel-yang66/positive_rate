"use client";
import { LuMoveVertical, LuSunrise, LuSunset } from "react-icons/lu";
import { DateTime } from "luxon";
import { LuClock } from "react-icons/lu";
import { useEffect, useRef, useState } from "react";
import { getSunrise, getSunset } from "sunrise-sunset-js";
import { tablesDB, getUser } from "../lib/appwrite";
import { Query } from "appwrite";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { notify } from "../commonFunctions.js/Toast";

export default function GeneralInfo({ info, tz, refreshStatus }) {
  const [time, setTime] = useState("--:--");
  const [id, setId] = useState("");
  const [status, setStatus] = useState(false);
  const lastUpdate = useRef(Date.now());
  const searchParams = useSearchParams();
  const { replace } = useRouter();
  const pathName = usePathname();

  async function getFavorites() {
    try {
      const data = await tablesDB.listRows({
        databaseId: process.env.NEXT_PUBLIC_DATABASE_ID,
        tableId: process.env.NEXT_PUBLIC_TABLE_ID_3,
        queries: [
          Query.and([
            Query.equal("type", "airport"),
            Query.equal("value", info.info.icao),
            Query.equal("user_id", id),
          ]),
        ],
      });
      setStatus(data["rows"].length > 0 ? true : false);
    } catch {
      setStatus(false);
      notify("An error occurred", "err");
    }
  }

  function UpdateInfo(text) {
    const params = new URLSearchParams(searchParams);
    text === "1" ? params.set("refresh", "0") : params.set("refresh", "1");
    replace(`${pathName}?${params.toString()}`);
  }

  async function HandleFavorite() {
    try {
      if (!status) {
        const newFave = await tablesDB.createRow({
          databaseId: process.env.NEXT_PUBLIC_DATABASE_ID,
          tableId: process.env.NEXT_PUBLIC_TABLE_ID_3,
          rowId: `${id}-${info.info.icao}`,
          data: {
            user_id: id,
            type: "airport",
            value: info.info.icao,
          },
        });
        setStatus(true);
      } else {
        const deletedRow = await tablesDB.deleteRow({
          databaseId: process.env.NEXT_PUBLIC_DATABASE_ID,
          tableId: process.env.NEXT_PUBLIC_TABLE_ID_3,
          rowId: `${id}-${info.info.icao}`,
        });
        setStatus(false);
      }
    } catch {
      notify("An error occurred", "err");
    }
  }

  useEffect(() => {
    getUser(setId);
  }, []);

  useEffect(() => {
    if (!id) return;
    getFavorites();
  }, [info, id]);

  useEffect(() => {
    const interval = setInterval(() => {
      if ((Date.now() - lastUpdate.current) / 1000 >= 300) {
        UpdateInfo(refreshStatus);
        lastUpdate.current = Date.now();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  let sunrise = getSunrise(info.info.latitude, info.info.longitude);
  let sunset = getSunset(info.info.latitude, info.info.longitude);

  sunrise = DateTime.fromJSDate(sunrise, { zone: tz });
  sunset = DateTime.fromJSDate(sunset, { zone: tz });

  sunrise = `${String(sunrise.hour).padStart(2, "0")}:${String(
    sunrise.minute,
  ).padStart(2, "0")}`;
  sunset = `${String(sunset.hour).padStart(2, "0")}:${String(
    sunset.minute,
  ).padStart(2, "0")}`;

  useEffect(() => {
    const interval = setInterval(() => {
      if (!tz) return;
      setTime(
        `${String(DateTime.now().setZone(tz).hour).padStart(2, "0")}:${String(
          DateTime.now().setZone(tz).minute,
        ).padStart(2, "0")}, ${DateTime.now().setZone(tz).monthShort} ${String(
          DateTime.now().setZone(tz).day,
        ).padStart(2, "0")}`,
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [tz]);

  return (
    <section className="font-semibold w-[96%] md:w-[40vw] h-[8vh] md:h-[7vh] grid self-start">
      <div className="flex gap-1 items-center text-xl md:text-2xl font-bold mb-2">
        <h1 className="text-slate-200">{info.info.city.split(", ")[0]}</h1>
        <h1 className="text-slate-400">{`(${
          info.info.icao ? `${info.info.icao}/` : ""
        }${info.info.iata ? `${info.info.iata}` : ""})`}</h1>
        <button
          onClick={() => HandleFavorite()}
          className="w-18 rounded-xl bg-blue-400 grid items-center justify-items-center self-end ml-2 text-sm"
        >
          {status ? "Unsave" : "Save"}
        </button>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex gap-2 items-center">
          <LuMoveVertical className="text-green-400 text-md" />
          <div className="inline-flex items-baseline text-slate-200">
            <p className="text-md">{info.info.elevation_ft}</p>
            <p className="text-sm">ft</p>
          </div>
        </div>

        <div className="flex gap-2 items-center">
          <LuClock className="text-blue-400 text-md" />
          <h2 className="text-slate-200 text-md">{time}</h2>
        </div>
        <div className="flex gap-2 items-center">
          <LuSunrise className="text-yellow-400 text-md" />
          <h2 className="text-slate-200 text-md">{sunrise}</h2>
        </div>
        <div className="flex gap-2 items-center">
          <LuSunset className="text-orange-500 text-md" />
          <h2 className="text-slate-200 text-md">{sunset}</h2>
        </div>
      </div>
    </section>
  );
}
