"use client";

import "../globals.css";
import { useState, useEffect, useRef } from "react";
import { tablesDB } from "../lib/appwrite";
import { Query } from "appwrite";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import Flights from "./Flights";
import Loading from "./Loading";
import { DateTime } from "luxon";
import { notify } from "../commonFunctions.js/Toast";

export default function Map({ air, aero }) {
  const map = useRef(null);
  const mapContainerRef = useRef();
  const [runways, setRunways] = useState(null);
  const [done, setDone] = useState(false);
  const [destInfo, setDestInfo] = useState();
  const [orgInfo, setOrgInfo] = useState();
  const [loading, setLoading] = useState(false);
  const sources = useRef(0);
  const markers = useRef([]);
  const popups = useRef([]);

  async function getRunways(val) {
    setLoading(true);
    try {
      const data = await tablesDB.listRows({
        databaseId: process.env.NEXT_PUBLIC_DATABASE_ID,
        tableId: process.env.NEXT_PUBLIC_TABLE_ID_2,
        queries: [Query.equal("airport_ident", val)],
      });
      setRunways(data["rows"]);
    } catch {
      setRunways(null);
      notify("Failed to connect to runway database", "err");
    } finally {
      setLoading(false);
    }
  }

  async function getAirports() {
    setLoading(true);
    try {
      const destinations = [
        ...new Set(
          aero.departures.map((a) =>
            a.movement.airport.icao ? a.movement.airport.icao : "",
          ),
        ),
      ];
      const origins = [
        ...new Set(
          aero.arrivals.map((a) =>
            a.movement.airport.icao ? a.movement.airport.icao : "",
          ),
        ),
      ];

      const destinationGeo = await tablesDB.listRows({
        databaseId: process.env.NEXT_PUBLIC_DATABASE_ID,
        tableId: process.env.NEXT_PUBLIC_TABLE_ID,
        queries: [
          Query.limit(destinations.length),
          Query.equal("icao_code", destinations),
        ],
      });

      const orgGeo = await tablesDB.listRows({
        databaseId: process.env.NEXT_PUBLIC_DATABASE_ID,
        tableId: process.env.NEXT_PUBLIC_TABLE_ID,
        queries: [
          Query.limit(origins.length),
          Query.equal("icao_code", origins),
        ],
      });
      setDestInfo(destinationGeo["rows"]);
      setOrgInfo(orgGeo["rows"]);
    } catch {
      notify("Failed to connect to airport database", "err");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!air) return;
    getRunways(air.split(",")[0]);
    getAirports();
  }, [air, aero]);

  useEffect(() => {
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAP_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/dark-v9",
      center: [-114, 33],
      zoom: 1.1,
    });

    map.current.on("load", () => setDone(true));

    return () => {
      map.current.remove();
    };
  }, []);

  useEffect(() => {
    if (!done) return;

    markers.current.length > 0
      ? markers.current.forEach((mark) => {
          mark.remove();
        })
      : null;
    markers.current = [];

    if (!destInfo && !orgInfo) return;

    [...new Set([...destInfo, ...orgInfo])].forEach((a, i) => {
      if (!a.longitude_deg || !a.latitude_deg) return;
      const popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnMove: false,
        offset: 10,
      }).setHTML(
        `<div className=mapboxgl-popup-content mapboxgl-popup-tip>${a.municipality} (${a.icao_code})</div>`,
      );
      const pin = document.createElement("div");
      if (
        destInfo.map((d) => d.icao_code).includes(a.icao_code) &&
        orgInfo.map((arr) => arr.icao_code).includes(a.icao_code)
      ) {
        pin.className = "both-pin";
      } else if (destInfo.map((d) => d.icao_code).includes(a.icao_code)) {
        pin.className = "dep-pin";
      } else if (orgInfo.map((arr) => arr.icao_code).includes(a.icao_code)) {
        pin.className = "arr-pin";
      }
      const marker = new mapboxgl.Marker({ element: pin })
        .setLngLat([a.longitude_deg, a.latitude_deg])
        .setPopup(popup)
        .addTo(map.current);
      markers.current = [...markers.current, marker];
    });
  }, [destInfo, orgInfo, done]);

  useEffect(() => {
    if (sources.current > 0) {
      for (let i = 0; i < sources.current; i++) {
        map.current.removeLayer(`runway${i}`);
        map.current.removeSource(`runway${i}`);
      }
    }

    if (popups.current.length > 0) {
      popups.current.forEach((p) => p.remove());
    }
    sources.current = 0;
    popups.current = [];
    if (!done || !runways) return;

    const depRunways = [
      ...new Set(
        aero.departures
          .filter((flt) => {
            return (
              flt.movement.revisedTime &&
              DateTime.fromISO(
                flt.movement.revisedTime.utc
                  .replace(" ", "T")
                  .replace("Z", ":00Z"),
              ).setZone("UTC") >=
                DateTime.now().setZone("UTC").plus({ hours: -1 })
            );
          })
          .map((flt) => flt.movement.runway),
      ),
    ];
    const arrRunways = [
      ...new Set(
        aero.arrivals
          .filter((flt) => {
            return (
              flt.movement.revisedTime &&
              DateTime.fromISO(
                flt.movement.revisedTime.utc
                  .replace(" ", "T")
                  .replace("Z", ":00Z"),
              ).setZone("UTC") >=
                DateTime.now().setZone("UTC").plus({ hours: -1 })
            );
          })
          .map((flt) => flt.movement.runway),
      ),
    ];

    runways.forEach((rwy, i) => {
      if (rwy.closed === 0) {
        sources.current += 1;

        const popupLe = new mapboxgl.Popup({
          closeButton: false,
          closeOnMove: false,
          closeOnClick: false,
          offset: -4,
        })
          .setHTML(
            `<div className=mapboxgl-popup-content mapboxgl-popup-tip>${rwy.le_ident}</div>`,
          )
          .setLngLat([rwy.le_longitude_deg, rwy.le_latitude_deg])
          .addTo(map.current);

        const popupHe = new mapboxgl.Popup({
          closeButton: false,
          closeOnMove: false,
          closeOnClick: false,
          offset: -4,
        })
          .setHTML(
            `<div className=mapboxgl-popup-content mapboxgl-popup-tip>${rwy.he_ident}</div>`,
          )
          .setLngLat([rwy.he_longitude_deg, rwy.he_latitude_deg])
          .addTo(map.current);
        popups.current = [...popups.current, popupHe, popupLe];

        map.current.addSource(`runway${i}`, {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: {
              type: "LineString",
              coordinates: [
                [rwy.he_longitude_deg, rwy.he_latitude_deg],
                [rwy.le_longitude_deg, rwy.le_latitude_deg],
              ],
            },
          },
        });

        let color;
        if (
          (depRunways.includes(rwy.le_ident) ||
            depRunways.includes(rwy.he_ident)) &&
          (arrRunways.includes(rwy.le_ident) ||
            arrRunways.includes(rwy.he_ident))
        ) {
          color = "#A78BFA";
        } else if (
          depRunways.includes(rwy.le_ident) ||
          depRunways.includes(rwy.he_ident)
        ) {
          color = "#60A5FA";
        } else if (
          arrRunways.includes(rwy.le_ident) ||
          arrRunways.includes(rwy.he_ident)
        ) {
          color = "#CA8A04";
        } else {
          color = "#CBD5E1";
        }
        map.current.addLayer({
          id: `runway${i}`,
          type: "line",
          source: `runway${i}`,
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": color,
            "line-width": 4,
          },
        });
      }
    });
    const airportCoords = [air.split(",")[1], air.split(",")[2]];
    map.current.flyTo({
      center: [airportCoords[1], airportCoords[0]],
      speed: 0.6,
      zoom: 13,
    });
  }, [done, runways]);

  return (
    <>
      <div
        id="map-container"
        ref={mapContainerRef}
        className={`rounded-lg w-[97vw] h-[43vh] md:w-[43vw] md:h-[88vh] z-[5] md:mt-[2vh]`}
      />

      {loading ? <Loading /> : <Flights aero={aero} />}
    </>
  );
}
