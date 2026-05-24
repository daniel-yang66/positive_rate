"use client";
import { useState } from "react";
import { tablesDB } from "../lib/appwrite";
import { Query } from "appwrite";
import { useDebouncedCallback } from "use-debounce";
import { useRouter, useSearchParams } from "next/navigation";
import Loading from "./Loading";
import { notify } from "../commonFunctions.js/Toast";

export default function Search() {
  const [value, setValue] = useState("");
  const [dropDownItems, setDropdownItems] = useState(null);
  const [collapse, setCollapse] = useState(true);
  const [searchType, setSearchType] = useState("airport");
  const [depValue, setDepValue] = useState("");
  const [arrValue, setArrValue] = useState("");
  const [currentSearch, setCurrentSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const { replace } = useRouter();
  const searchParams = useSearchParams();

  async function getAirports(val) {
    setDropdownItems([{ icao_code: "Searching...", name: "" }]);
    try {
      const data = await tablesDB.listRows({
        databaseId: process.env.NEXT_PUBLIC_DATABASE_ID,
        tableId: process.env.NEXT_PUBLIC_TABLE_ID,
        queries: [
          Query.limit(5),
          Query.or([
            Query.startsWith("iata_code", val),
            Query.startsWith("icao_code", val),
            Query.startsWith("name", val),
          ]),
        ],
      });
      setDropdownItems(data["rows"]);
    } catch {
      setDropdownItems(null);
    }
  }

  function HandleAirport(text) {
    const params = new URLSearchParams(searchParams);
    text ? params.set("airport", text) : params.delete("airport");
    params.delete("route");
    params.delete("flightno");
    replace(`/?${params.toString()}`);
    setLoading(false);
  }
  function HandleFlight(text) {
    if (!text || text.length <= 0) {
      notify("Please enter a valid flight number", "err");
      setLoading(false);
      return;
    }
    const params = new URLSearchParams(searchParams);
    text ? params.set("flightno", text) : params.delete("flightno");
    params.delete("route");
    params.delete("airport");
    replace(`/flights?${params.toString()}`);
    setLoading(false);
  }

  function HandleRoute(text) {
    const params = new URLSearchParams(searchParams);
    text ? params.set("route", text) : params.delete("route");
    params.delete("flightno");
    params.delete("airport");
    replace(`/flights?${params.toString()}`);
    setLoading(false);
  }

  const debounce = useDebouncedCallback(getAirports, 700);

  if (loading) {
    return <Loading />;
  } else if (searchType === "airport") {
    return (
      <section className="absolute top-2 right-2 grid gap-2 font-semibold text-slate-900 z-[20]">
      
        <input
          onFocus={() => setCollapse(false)}
          onBlur={() => setCollapse(true)}
          onChange={async (e) => {
            setCollapse(false);
            setValue(e.target.value);
            e.target.value.length > 2
              ? debounce(e.target.value.trim().toUpperCase())
              : setDropdownItems([]);
          }}
          value={value}
          className="rounded-lg w-[50vw] h-[4vh] md:w-[20vw] md:h-[5vh] bg-slate-400 p-2 text-slate-900"
          placeholder="Search Airport"
          type="text"
        />
        <div
          className={
            collapse
              ? "hidden"
              : "grid w-full h-4/5 mt-2 rounded-lg justify-items-center"
          }
        >
          <div className="bg-slate-700 rounded-lg grid items-center justify-items-center w-full p-2">
            <h3 className="text-slate-300 text-md mb-2">Search by</h3>
            <div className="flex gap-[2px] w-full">
              <div
                onMouseDown={(e) => {
                  e.preventDefault();
                  setSearchType("route");
                  setCollapse(true);
                  setValue("");
                  setDropdownItems(null);
                }}
                className="relative items-center w-full text-md font-semibold bg-slate-400 hover:cursor-pointer text-center hover:bg-blue-800 hover:text-slate-300 rounded-lg mb-2"
              >
                {"Route"}
              </div>
              <div
                onMouseDown={(e) => {
                  e.preventDefault();
                  setSearchType("number");
                  setCollapse(true);
                  setValue("");
                  setDropdownItems(null);
                }}
                className="relative items-center w-full text-md font-semibold bg-slate-400 hover:cursor-pointer text-center hover:bg-blue-800 hover:text-slate-300 rounded-lg mb-2"
              >
                {"Flt No."}
              </div>
            </div>
          </div>
          {dropDownItems && !collapse
            ? dropDownItems.map((item, i) => {
                return (
                  <div
                    key={i}
                    className={`grid hover:cursor-pointer hover:bg-slate-800 hover:text-slate-300 justify-items-center items-center bg-slate-300 w-full h-6 ${
                      i == dropDownItems.length - 1
                        ? "rounded-br-lg rounded-bl-lg"
                        : i == 0
                        ? "rounded-tr-lg rounded-tl-lg"
                        : ""
                    }`}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      if (item["icao_code"] !== "Searching...") {
                        setLoading(true);
                        setValue(item["icao_code"]);
                        HandleAirport(
                          `${item["icao_code"]},${item["latitude_deg"]},${item["longitude_deg"]}`
                        );
                        setCollapse(true);
                      }
                    }}
                  >
                    {`${item.name}${
                      item.icao_code === "Searching..."
                        ? " Searching..."
                        : ` (${item.icao_code})`
                    }`}
                  </div>
                );
              })
            : ""}
        </div>
      </section>
    );
  } else if (searchType === "number") {
    return (
      <section className="absolute top-2 right-2 grid gap-2 font-semibold text-slate-900 z-[20]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setLoading(true);
            HandleFlight(value);
            setCollapse(true);
          }}
        >
          <input
            onFocus={() => setCollapse(false)}
            onBlur={() => setCollapse(true)}
            onChange={async (e) => {
              setCollapse(false);
              setValue(e.target.value);
            }}
            value={value}
            className="rounded-lg w-[50vw] h-[4vh] md:w-[20vw] md:h-[5vh] bg-slate-400 p-2 text-slate-900"
            placeholder="Flight No."
            type="text"
          />
        </form>
        <div
          className={
            collapse
              ? "hidden"
              : "grid w-full h-4/5 mt-2 rounded-lg justify-items-center"
          }
        >
          <div className="bg-slate-700 rounded-lg grid items-center justify-items-center w-full p-2">
            <h3 className="text-slate-300 text-md mb-2">Search by</h3>
            <div className="flex gap-[2px] w-full">
              <div
                onMouseDown={(e) => {
                  e.preventDefault();
                  setSearchType("route");
                  setCollapse(true);
                  setValue("");
                  setDropdownItems(null);
                }}
                className="relative items-center w-full text-md font-semibold bg-slate-400 hover:cursor-pointer text-center hover:bg-blue-800 hover:text-slate-300 rounded-lg mb-2"
              >
                {"Route"}
              </div>
              <div
                onMouseDown={(e) => {
                  e.preventDefault();
                  setSearchType("airport");
                  setCollapse(true);
                  setValue("");
                  setDropdownItems(null);
                }}
                className="relative items-center w-full text-md font-semibold bg-slate-400 hover:cursor-pointer text-center hover:bg-blue-800 hover:text-slate-300 rounded-lg mb-2"
              >
                {"Airport"}
              </div>
            </div>
          </div>
          {dropDownItems && !collapse
            ? dropDownItems.map((item, i) => {
                return (
                  <div
                    key={i}
                    className={`grid hover:cursor-pointer hover:bg-slate-800 hover:text-slate-300 justify-items-center items-center bg-slate-300 w-full h-6 ${
                      i == dropDownItems.length - 1
                        ? "rounded-br-lg rounded-bl-lg"
                        : i == 0
                        ? "rounded-tr-lg rounded-tl-lg"
                        : ""
                    }`}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      if (item["icao_code"] !== "Searching...") {
                        setValue(item["icao_code"]);
                        HandleAirport(
                          `${item["icao_code"]},${item["latitude_deg"]},${item["longitude_deg"]}`
                        );
                        setCollapse(true);
                      }
                    }}
                  >
                    {`${item.name}${
                      item.icao_code === "Searching..."
                        ? " Searching..."
                        : ` (${item.icao_code})`
                    }`}
                  </div>
                );
              })
            : ""}
        </div>
      </section>
    );
  } else if (searchType === "route") {
    return (
      <section className="absolute top-2 right-2 grid gap-2 font-semibold text-slate-900 z-[20]">
        <form className="flex gap-2">
          <input
            onFocus={() => {
              setCollapse(false);
              setCurrentSearch("dep");
            }}
            onBlur={() => setCollapse(true)}
            onChange={async (e) => {
              setCollapse(false);
              setCurrentSearch("dep");
              if (e.target.value === "Searching...") return;
              setDepValue(e.target.value);
              e.target.value.length > 2
                ? debounce(e.target.value.trim().toUpperCase())
                : setDropdownItems([]);
            }}
            className="rounded-lg w-[23vw] h-[4vh] md:w-[10vw] md:h-[5vh] bg-slate-400 p-2 text-slate-900"
            placeholder="DEP"
            type="text"
            value={depValue}
          />
          <input
            onFocus={() => {
              setCollapse(false);
              setCurrentSearch("arr");
            }}
            onBlur={() => setCollapse(true)}
            onChange={async (e) => {
              setCollapse(false);
              setCurrentSearch("arr");
              if (e.target.value === "Searching...") return;
              setArrValue(e.target.value);
              e.target.value.length > 2
                ? debounce(e.target.value.trim().toUpperCase())
                : setDropdownItems([]);
            }}
            className="rounded-lg w-[23vw] h-[4vh] md:w-[10vw] md:h-[5vh] bg-slate-400 p-2 text-slate-900"
            placeholder="ARR"
            type="text"
            value={arrValue}
          />
          <button
            onClick={(e) => {
              e.preventDefault();
              if (!depValue || !arrValue) {
                notify("Enter both departure & arrival airport", "err");
                return;
              }
              setLoading(true);
              HandleRoute(`${depValue},${arrValue}`);
            }}
            className="w-[8vw] h-[4vh] md:w-[5vw] md:h-[5vh] bg-emerald-600 rounded-lg grid items-center justify-items-center text-slate-300"
          >
            Go
          </button>
        </form>
        <div
          className={
            collapse
              ? "hidden"
              : "grid w-full h-4/5 mt-2 rounded-lg justify-items-center"
          }
        >
          <div className="bg-slate-700 rounded-lg grid items-center justify-items-center w-full p-2">
            <h3 className="text-slate-300 text-md mb-2">Search by</h3>
            <div className="flex gap-[2px] w-full">
              <div
                onMouseDown={(e) => {
                  e.preventDefault();
                  setSearchType("airport");
                  setCollapse(true);
                  setValue("");
                  setDropdownItems(null);
                }}
                className="relative items-center w-full text-md font-semibold bg-slate-400 hover:cursor-pointer text-center hover:bg-blue-800 hover:text-slate-300 rounded-lg mb-2"
              >
                {"Airport"}
              </div>
              <div
                onMouseDown={(e) => {
                  e.preventDefault();
                  setSearchType("number");
                  setCollapse(true);
                  setValue("");
                  setDropdownItems(null);
                }}
                className="relative items-center w-full text-md font-semibold bg-slate-400 hover:cursor-pointer text-center hover:bg-blue-800 hover:text-slate-300 rounded-lg mb-2"
              >
                {"Flt No."}
              </div>
            </div>
          </div>

          {dropDownItems && !collapse
            ? dropDownItems.map((item, i) => {
                return (
                  <div
                    key={i}
                    className={`grid hover:cursor-pointer hover:bg-slate-800 hover:text-slate-300 justify-items-center items-center bg-slate-300 w-full h-6 ${
                      i == dropDownItems.length - 1
                        ? "rounded-br-lg rounded-bl-lg"
                        : i == 0
                        ? "rounded-tr-lg rounded-tl-lg"
                        : ""
                    }`}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      if (item["icao_code"] !== "Searching...") {
                        currentSearch === "dep"
                          ? setDepValue(item["icao_code"])
                          : setArrValue(item["icao_code"]);

                        setCollapse(true);
                      }
                    }}
                  >
                    {`${item.name}${
                      item.icao_code === "Searching..."
                        ? " Searching..."
                        : ` (${item.icao_code})`
                    }`}
                  </div>
                );
              })
            : ""}
        </div>
      </section>
    );
  }
}
