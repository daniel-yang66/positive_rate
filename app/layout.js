import "./globals.css";
import Title from "./components/Title";
import Search from "./components/Search";
import TopBar from "./components/TopBar";
import { Suspense } from "react";
import Loading from "./components/Loading";
import ToastLauncher from "./components/ToastProvider";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="grid justify-items-center grid-rows-[3vh_4vh_0vh_1fr] relative bg-linear-to-br from-slate-950 to-slate-600 w-screen h-screen m-0 font-sans">
        <Title loading={false} />
        <Suspense fallback={<Loading />}>
          <Search />
        </Suspense>
        <TopBar />
        <ToastLauncher />

        {children}
        <footer className="absolute left-4 top-[98vh] md:top-[97vh] text-slate-300 font-semibold text-[9px] md:text-sm">
          {" "}
          &copy;{" "}
          <a
            href="https://www.linkedin.com/in/daniel-yang-a17ab3229/"
            target="_blank"
            rel="noreferrer"
            className="a"
          >
            Daniel Yang
          </a>{" "}
          | Powered by{" "}
          <a
            href="https://airlabs.co/"
            target="_blank"
            rel="noreferrer"
            className="a"
          >
            AirLabs
          </a>
          ,{" "}
          <a
            href="https://aerodatabox.com/"
            target="_blank"
            rel="noreferrer"
            className="a"
          >
            AeroDataBox
          </a>
          ,{" "}
          <a
            href="https://info.avwx.rest/"
            target="_blank"
            rel="noreferrer"
            className="a"
          >
            AVWX
          </a>
        </footer>
      </body>
    </html>
  );
}
