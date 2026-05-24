import { LuMoveVertical, LuPlaneTakeoff } from "react-icons/lu";

export default function Title({ loading }) {
  return (
    <div
      className={`grid ${
        loading
          ? "fixed top-[50vh] left-[50vw] -translate-x-1/2 -translate-y-1/2"
          : "justify-self-start"
      } font-sans font-bold ${loading ? "animate-pulse z-[30]" : ""}`}
    >
      <div className="inline-flex items-top">
        <div className="inline-flex items-baseline text-blue-300 font-bold">
          <LuPlaneTakeoff
            className={`${
              !loading
                ? "text-[38px] md:text-[45px]"
                : "text-[52px] md:text-[59px]"
            }`}
          />
          <LuMoveVertical
            className={`${
              !loading
                ? "text-[18px] md:text-[25px]"
                : "text-[32px] md:text-[39px]"
            }`}
          />
        </div>
        <div
          className={`inline-flex items-center ${
            !loading
              ? "text-[13px] md:text-[20px]"
              : "text-[27px] md:text-[34px]"
          } text-emerald-400 italic`}
        >
          <h1>+</h1>
          <h1>Rate</h1>
        </div>
      </div>
    </div>
  );
}
