"use client";
import { useState, useEffect, useRef } from "react";
import { LuTowerControl } from "react-icons/lu";
import { Query } from "appwrite";
import AirportWeather from "../api/AirportWeather";
import tz_lookup from "tz-lookup";
import FaveAirport from "./FaveAirport";
import { tablesDB, getUser } from "../lib/appwrite";
import Loading from "./Loading";
import { notify } from "../commonFunctions.js/Toast";
export default function Dashboard() {
  const [name, setName] = useState("--");
  const [id, setId] = useState();
  const [airports, setAirports] = useState();
  const [currentWeather, setCurrentWeather] = useState([]);
  const [loading, setLoading] = useState(false);
  const lastUpdate = useRef(Date.now());

  function getTimeOfDay() {
    const hour = new Date().getHours();
    if (hour >= 0 && hour < 12) return "Morning";
    if (hour >= 12 && hour < 18) return "Afternoon";
    if (hour >= 18) return "Evening";
  }

  async function getFavorites() {
    setLoading(true);
    try {
      const data = await tablesDB.listRows({
        databaseId: process.env.NEXT_PUBLIC_DATABASE_ID,
        tableId: process.env.NEXT_PUBLIC_TABLE_ID_3,
        queries: [Query.equal("user_id", [id])],
      });
      setAirports(data["rows"].filter((row) => row.type === "airport"));
    } catch (err) {
      notify(err.message, "err");
    } finally {
      setLoading(false);
    }
  }

  function getWeather() {
    if (!airports) return;
    setCurrentWeather([]);
    airports.forEach(async (a) => {
      setLoading(true);
      try {
        const weather = await AirportWeather(a.value);
        setCurrentWeather((prev) => [...prev, weather]);
      } catch {
        notify(`Failed to get ${a.value} weather`, "err");
      } finally {
        setLoading(false);
      }
    });
  }

  useEffect(() => {
    getUser(setId, setName);
  }, []);

  useEffect(() => {
    if (!id) return;
    getFavorites();
  }, [id]);

  useEffect(() => {
    getWeather();
  }, [airports]);

  useEffect(() => {
    const interval = setInterval(() => {
      if ((Date.now() - lastUpdate.current) / 1000 >= 300) {
        getWeather();
        lastUpdate.current = Date.now();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!loading) {
    return (
      <section className="font-semibold text-slate-300 grid justify-items-center gap-2 mt-[2vh]">
        <div className="text-center text-blue-300 italic">
          <h2 className="text-[30px]">
            {getTimeOfDay()}, {name}
          </h2>
          <h3 className="text-[16px]">Hope you are having a fly day</h3>
        </div>
        <div className="grid gap-4 justify-items-center">
          <div className="flex gap-2 items-center text-[30px]">
            <LuTowerControl />
            <h2>Airports</h2>
          </div>
          {currentWeather.length > 0 ? (
            <div className="h-[60vh] md:h-[40vh] w-[94vw] md:w-[75vw] flex flex-col gap-2 md:grid md:justify-items-center items-center md:grid-cols-[minmax(28vw,_1fr)_minmax(28vw,_1fr)] overflow-auto">
              {currentWeather.map((c, i) => {
                const tz = tz_lookup(c.info.latitude, c.info.longitude);
                return <FaveAirport wx={c} tz={tz} key={i} />;
              })}
            </div>
          ) : (
            <h2 className="text-lg">No Saved Airports</h2>
          )}
        </div>
      </section>
    );
  } else {
    return <Loading />;
  }
}
