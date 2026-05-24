"use client";
import { useState, useEffect, useRef } from "react";
import { renderToString } from "react-dom/server";
import { MdAirplanemodeActive } from "react-icons/md";

import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { greatCircle, point } from "@turf/turf";

export default function FlightMap({ info, depWx, arrWx }) {
  const map = useRef(null);
  const mapContainerRef = useRef();
  const [done, setDone] = useState(false);
  const markers = useRef([]);
  const popUps = useRef([]);

  const createCustomMarker = (
    icon,
    rotation,
    color = "oklch(70.7% 0.165 254.624)"
  ) => {
    const iconString = renderToString(
      <div style={{ color, fontSize: "35px", rotate: `${rotation}deg` }}>
        {icon}
      </div>
    );
    const el = document.createElement("div");
    el.innerHTML = iconString;
    el.style.cursor = "pointer";

    return el;
  };

  useEffect(() => {
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAP_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/dark-v9",
      center: [-114, 33],
      zoom: 1.5,
    });

    map.current.on("load", () => setDone(true));

    return () => {
      map.current.remove();
    };
  }, []);

  useEffect(() => {
    markers.current.forEach((m) => m.remove());
    popUps.current.forEach((p) => p.remove());
    popUps.current = [];
    markers.current = [];
    if (map.current.getLayer("route")) {
      map.current.removeLayer("route");
      map.current.removeSource("route");
    }
    if (!info.lng) return;
    const depPin = document.createElement("div");
    depPin.className = "dep-pin";
    const planePin = document.createElement("div");
    planePin.className = "plane-pin";

    const arrPin = document.createElement("div");
    arrPin.className = "arr-pin";

    const popupDep = new mapboxgl.Popup({
      closeButton: false,
      closeOnMove: false,
      closeOnClick: false,
      offset: 10,
    }).setHTML(
      `<div className=mapboxgl-popup-content-airport mapboxgl-popup-tip>${info.dep_city}</div>`
    );
    const popupArr = new mapboxgl.Popup({
      closeButton: false,
      closeOnMove: false,
      closeOnClick: false,
      offset: 10,
    }).setHTML(
      `<div className=mapboxgl-popup-content-airport mapboxgl-popup-tip>${info.arr_city}</div>`
    );
    const popupAir = new mapboxgl.Popup({
      closeButton: false,
      closeOnMove: false,
      closeOnClick: false,
      offset: 10,
    }).setHTML(
      `<div className=mapboxgl-popup-content mapboxgl-popup-tip><p>ALT: ${
        info.alt && info.alt !== 0
          ? Math.round(info.alt * 3.28).toLocaleString()
          : "0"
      }ft</p> <p>GS: ${Math.round(
        info.speed * 0.54
      )}kt</p>  <p>HDG: ${Math.round(info.dir)}\xB0</p></div>`
    );
    const depMarker = new mapboxgl.Marker({ element: depPin })
      .setLngLat([depWx.info.longitude, depWx.info.latitude])
      .setPopup(popupDep)
      .addTo(map.current)
      .togglePopup();

    const planeMarker = createCustomMarker(<MdAirplanemodeActive />, info.dir);

    const airMarker = new mapboxgl.Marker(planeMarker)
      .setLngLat([info.lng, info.lat])
      .setRotationAlignment("map")
      .addTo(map.current)
      .setPopup(popupAir)
      .togglePopup();

    const arrMarker = new mapboxgl.Marker({ element: arrPin })
      .setLngLat([arrWx.info.longitude, arrWx.info.latitude])
      .setPopup(popupArr)
      .addTo(map.current)
      .togglePopup();

    markers.current = [...markers.current, airMarker, depMarker, arrMarker];
    popUps.current = [...popUps.current, popupDep, popupArr, popupAir];

    if (done) {
      const planePoint = point([info.lng, info.lat]);
      const destPoint = point([arrWx.info.longitude, arrWx.info.latitude]);
      const line = greatCircle(planePoint, destPoint, {
        npoints: 200,
      });
      map.current.addSource("route", {
        type: "geojson",
        data: line,
      });
      map.current.addLayer({
        id: "route",
        type: "line",
        source: "route",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "lightgreen",
          "line-width": 2,
          "line-dasharray": [3, 2],
        },
      });
      const feature = {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [depWx.info.longitude, depWx.info.latitude],
            },
          },
          {
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [arrWx.info.longitude, arrWx.info.latitude],
            },
          },
        ],
      };

      map.current.flyTo({
        center: [info.lng, info.lat],
        speed: 0.4,
        zoom: 4,
      });
    }
  }, [done, info]);
  return (
    <div
      id="map-container"
      ref={mapContainerRef}
      className="rounded-lg w-[98vw] h-[34vh] md:w-[75vw] md:h-[40vh] mt-[3vh]"
    />
  );
}
