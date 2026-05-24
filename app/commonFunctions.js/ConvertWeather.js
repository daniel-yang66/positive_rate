import {
  WiCloudy,
  WiDayCloudy,
  WiDayFog,
  WiDayRain,
  WiDaySnow,
  WiDaySunny,
  WiDaySunnyOvercast,
  WiDayThunderstorm,
  WiNightAltCloudy,
  WiNightAltPartlyCloudy,
  WiNightClear,
  WiNightFog,
  WiNightRain,
  WiNightSnow,
  WiNightThunderstorm,
} from "react-icons/wi";
import { getSunrise, getSunset } from "sunrise-sunset-js";
import { DateTime } from "luxon";
export default function ConvertWeather(clouds, codes, info, tz) {
  let sunrise = getSunrise(info.info.latitude, info.info.longitude);
  let sunset = getSunset(info.info.latitude, info.info.longitude);

  sunrise = DateTime.fromJSDate(sunrise, { zone: tz });
  sunset = DateTime.fromJSDate(sunset, { zone: tz });

  sunrise = `${String(sunrise.hour).padStart(2, "0")}:${String(
    sunrise.minute
  ).padStart(2, "0")}`;
  sunset = `${String(sunset.hour).padStart(2, "0")}:${String(
    sunset.minute
  ).padStart(2, "0")}`;

  const currentTime = `${String(DateTime.now().setZone(tz).hour).padStart(
    2,
    "0"
  )}:${String(DateTime.now().setZone(tz).minute).padStart(2, "0")}`;

  let night = true;
  if (currentTime > sunrise && currentTime < sunset) night = false;
  let ceiling = "--";

  let condition = "Fair";
  let symbol = night ? (
    <WiNightClear className="text-[40px]" />
  ) : (
    <WiDaySunny className="text-[40px]" />
  );

  clouds.some((cloud) => {
    if (cloud.type === "BKN" || cloud.type === "OVC" || cloud.type === "VV") {
      ceiling = Math.round(cloud.altitude * 100).toLocaleString();
      return true;
    }
  });

  if (codes.length === 0 && clouds.length > 0) {
    clouds.forEach((cloud) => {
      if (cloud.type === "SCT" || cloud.type === "FEW") {
        condition = "Fair";
        symbol = night ? (
          <WiNightAltPartlyCloudy className="text-[40px]" />
        ) : (
          <WiDaySunnyOvercast className="text-[40px]" />
        );
      } else if (cloud.type === "OVC" || cloud.type === "VV") {
        condition = "Overcast";
        symbol = <WiCloudy className="text-[40px]" />;
      } else if (cloud.type === "BKN") {
        condition = "Cloudy";
        symbol = night ? (
          <WiNightAltCloudy className="text-[40px]" />
        ) : (
          <WiDayCloudy className="text-[40px]" />
        );
      }
    });
  } else {
    codes.forEach((code) => {
      if (
        code.repr.includes("RA") ||
        code.repr.includes("DZ") ||
        code.repr.includes("SH")
      ) {
        condition = code.value;
        symbol = night ? (
          <WiNightRain className="text-[40px]" />
        ) : (
          <WiDayRain className="text-[40px]" />
        );
      } else if (
        code.repr.includes("SN") ||
        code.repr.includes("GR") ||
        code.repr.includes("GS") ||
        code.repr.includes("SG") ||
        code.repr.includes("IC") ||
        code.repr.includes("PL")
      ) {
        condition = code.value;
        symbol = night ? (
          <WiNightSnow className="text-[40px]" />
        ) : (
          <WiDaySnow className="text-[40px]" />
        );
      } else if (
        code.repr.includes("FG") ||
        code.repr.includes("BR") ||
        code.repr.includes("HZ") ||
        code.repr.includes("FU") ||
        code.repr.includes("SA") ||
        code.repr.includes("DU")
      ) {
        condition = code.value;
        symbol = night ? (
          <WiNightFog className="text-[40px]" />
        ) : (
          <WiDayFog className="text-[40px]" />
        );
      } else if (code.repr.includes("TS")) {
        condition = code.value;
        symbol = night ? (
          <WiNightThunderstorm className="text-[40px]" />
        ) : (
          <WiDayThunderstorm className="text-[40px]" />
        );
      }
    });
  }
  return {
    ceiling: ceiling,
    symbol: symbol,
    condition: condition,
  };
}
