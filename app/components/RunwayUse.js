"use client";
import { useState, useEffect } from "react";
import { LuTally2 } from "react-icons/lu";

export default function RunwayUsage({ info }) {
  const [counter, setCounter] = useState(-1);

  useEffect(() => {
    const interval = setInterval(() => {
      setCounter((prev) => (prev === 2 ? -1 : prev + 1));
    }, 250);

    return () => clearInterval(interval);
  }, []);
  return (
    <section className="relative grid grid-none items-center gap-4 font-semibold w-[60vw] md:w-[24vw] h-[16vh] md:h-[22vh] bg-slate-700 rounded-lg text-slate-200 p-2 mt-2 overflow-auto">
      <div className="flex items-center absolute top-1 left-1 w-full">
        <LuTally2 className="text-slate-400 text-[30px]" />
        <h2 className="text-lg text-slate-300 font-bold">Runways</h2>
      </div>
      <div className="grid mt-4 h-[85%]">
        {info.info.runways.map((rwy, i) => {
          return (
            <div key={i} className="relative grid w-[96%] rounded-lg p-2">
              <div className="flex gap-2 flex-none text-slate-300 text-sm">
                <div className="flex items-baseline flex-nowrap">
                  <p className="text-md">{`${rwy.width_ft.toLocaleString()} x ${rwy.length_ft.toLocaleString()}`}</p>
                  <p className="text-xs">ft</p>
                  <p className="flex self-center text-slate-400 ml-2">
                    {`${rwy.surface[0].toUpperCase()}${rwy.surface.slice(1)}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 p-1">
                <div className="flex gap-[3px]">
                  {[0, 1, 2].map((item, i) => {
                    return (
                      <div
                        key={item}
                        className={`h-[8px] w-[8px] rounded-full ${
                          counter === item && rwy.lights
                            ? "bg-slate-100"
                            : "bg-slate-800"
                        }`}
                      ></div>
                    );
                  })}
                </div>

                <div className="h-8 bg-slate-950 flex justify-between items-center gap-2">
                  <div className="grid gap-[3px]">
                    {[1, 2, 3].map((item, i) => {
                      return (
                        <div
                          key={item}
                          className="h-[5px] w-4 bg-slate-200"
                        ></div>
                      );
                    })}
                  </div>
                  <p
                    className="text-sm font-bold text-slate-200"
                    style={{ rotate: "90deg" }}
                  >
                    {rwy.ident1}
                  </p>
                  <div className="flex gap-[3px]">
                    {[1, 2, 3, 4, 5, 6, 7].map((item, i) => {
                      return (
                        <div
                          key={item}
                          className="h-[2px] w-4 bg-slate-200"
                        ></div>
                      );
                    })}
                  </div>

                  <p
                    className="text-sm font-bold text-slate-200"
                    style={{ rotate: "-90deg" }}
                  >
                    {rwy.ident2}
                  </p>

                  <div className="grid gap-[3px]">
                    {[1, 2, 3].map((item, i) => {
                      return (
                        <div
                          key={item}
                          className="h-[5px] w-4 bg-slate-200"
                        ></div>
                      );
                    })}
                  </div>
                </div>
                {[2, 1, 0].map((item, i) => {
                  return (
                    <div
                      key={item}
                      className={`h-[8px] w-[8px] rounded-full ${
                        counter === item && rwy.lights
                          ? "bg-slate-100"
                          : "bg-slate-800"
                      }`}
                    ></div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
