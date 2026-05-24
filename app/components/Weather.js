import {
  LuCloudSunRain,
  LuCloud,
  LuWind,
  LuBinoculars,
  LuThermometer,
  LuArrowUp,
} from "react-icons/lu";
import { DateTime } from "luxon";
import { clsx } from "clsx";
import ConvertWeather from "../commonFunctions.js/ConvertWeather";

export default function Weather({ wx, forecast, tz }) {
  const temp = wx.temperature ? wx.temperature.value : "--";
  const vis = wx.visibility ? wx.visibility.value : "--";
  const ws =
    wx.wind_gust && wx.wind_speed
      ? `${wx.wind_speed.value}/${wx.wind_gust.value}`
      : wx.wind_speed
        ? wx.wind_speed.value
        : 0;
  const wd = wx.wind_direction ? wx.wind_direction.value + 180 : 0;
  const clouds = wx.clouds;
  const codes = wx.wx_codes;
  const fr = wx.flight_rules;

  const wxDerived = ConvertWeather(clouds, codes, wx, tz);
  const condition = wxDerived.condition;
  const symbol = wxDerived.symbol;
  const ceiling = wxDerived.ceiling;

  return (
    <section className="relative flex-none grid items-center gap-1 font-semibold w-[96%] h-[17vh] md:h-[19vh] bg-slate-700 rounded-lg text-slate-200 p-2">
      <div className="flex gap-1 items-center absolute top-1 left-1">
        <LuCloudSunRain className="text-slate-400 text-[30px]" />
        <h2 className=" text-lg md:text-xl text-slate-300 font-bold">
          Weather
        </h2>
      </div>
      <div className="absolute top-1 right-1 flex gap-2 items-center">
        <div
          className={clsx(`w-4 h-4 rounded-full`, {
            "bg-green-400": fr === "VFR",
            "bg-blue-400": fr === "MVFR",
            "bg-red-400": fr === "IFR",
            "bg-purple-400": fr === "LIFR",
          })}
        ></div>
        <h2 className="text-xl">{fr}</h2>
      </div>
      <section className="flex items-center gap-8 w-[87vw] md:w-[40vw]">
        <div className="flex gap-2 items-center">
          {symbol}
          <h2 className="text-xl">{condition}</h2>
        </div>
        <div className="w-[65%] -mt-2 overflow-auto">
          <h1 className="mb-1 text-slate-300">Forecast</h1>
          <div className="flex gap-2 overflow-auto">
            {forecast.forecast.map((item, i) => {
              const startHour = String(
                DateTime.fromISO(
                  item.transition_start
                    ? item.transition_start.dt
                    : item.start_time.dt,
                  { zone: tz },
                ).hour,
              ).padStart(2, "0");
              const endHour = String(
                DateTime.fromISO(item.end_time.dt, { zone: tz }).hour,
              ).padStart(2, "0");

              let dayDiff = 0;

              const current = DateTime.fromFormat(
                DateTime.now().setZone(tz).toFormat("yyyy-MM-dd"),
                "yyyy-MM-dd",
              );

              const endDate = DateTime.fromFormat(
                DateTime.fromISO(item.end_time.dt, { zone: tz }).toFormat(
                  "yyyy-MM-dd",
                ),
                "yyyy-MM-dd",
              );

              if (endDate.diff(current, "days").days !== 0) {
                dayDiff =
                  endDate.diff(current, "days").days > 0
                    ? `(+${endDate.diff(current, "days").days})`
                    : `(-${endDate.diff(current, "days").days})`;
              }

              return (
                <div
                  key={i}
                  className={clsx(
                    `flex-none grid items-center justify-items-center w-[80px] h-[25px] rounded-lg text-slate-950`,
                    {
                      "bg-green-400": item.flight_rules === "VFR",
                      "bg-blue-400": item.flight_rules === "MVFR",
                      "bg-red-400": item.flight_rules === "IFR",
                      "bg-purple-400": item.flight_rules === "LIFR",
                    },
                  )}
                >
                  <div className="flex items-center gap-[3px]">
                    <p className="text-md">{`${startHour}-${endHour}`}</p>
                    {dayDiff !== 0 ? (
                      <p className="text-xs">{dayDiff}</p>
                    ) : (
                      <></>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      <section className="absolute bottom-1 left-2 flex gap-4 items-center w-[96%] md:w-[90%] overflow-auto">
        <div className="flex gap-1 items-center">
          <LuThermometer className="text-red-300 text-[25px]" />
          <div className="inline-flex items-top">
            <p className="text-lg">{temp}</p>
            <p className="text-sm">{`\xB0${wx.units.temperature}`}</p>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <LuCloud className="text-slate-100 text-[25px]" />
          <div className="inline-flex items-baseline">
            <p className="text-lg">{ceiling}</p>
            <p className="text-sm">{wx.units.altitude}</p>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <LuWind className="text-blue-300 text-[25px]" />
          <div className="inline-flex items-baseline">
            <p className="text-lg">{ws}</p>
            <p className="text-sm">{wx.units.wind_speed}</p>
          </div>
          <LuArrowUp
            className={`text-slate-300 text-[20px]`}
            style={{ rotate: `${wd}deg` }}
          />
        </div>
        <div className="flex gap-2 items-center">
          <LuBinoculars className="text-emerald-300 text-[25px]" />
          <div className="inline-flex items-baseline">
            <p className="text-lg">{vis}</p>
            <p className="text-sm">{wx.units.visibility}</p>
          </div>
        </div>
      </section>
    </section>
  );
}
