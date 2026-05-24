"use client";
import { LuHouse, LuIdCard, LuPowerOff } from "react-icons/lu";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { account } from "../lib/appwrite";
import Loading from "./Loading";
import { notify } from "../commonFunctions.js/Toast";

export default function TopBar() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function SignOut() {
    setLoading(true);
    try {
      const result = await account.deleteSession({
        sessionId: "current",
      });
      router.push("/authentication");
    } catch {
      notify("Failed to log out", "err");
    } finally {
      setLoading(false);
    }
  }
  if (!loading) {
    return (
      <section className="text-slate-300 font-semibold flex gap-6 items-center text-md md:text-lg mt-[4vh] md:mt-0">
        <div
          onClick={() => {
            setLoading(true);
            router.push("/dashboard");
            setLoading(false);
          }}
          className="flex gap-1 items-center"
        >
          <LuHouse className="text-blue-300" />
          <h2>Dashboard</h2>
        </div>
        <div
          onClick={() => {
            setLoading(true);
            router.push("/profile");
            setLoading(false);
          }}
          className="flex gap-1 items-center"
        >
          <LuIdCard className="text-blue-300" />
          <h2>Profile</h2>
        </div>
        <div
          onClick={() => {
            SignOut();
          }}
          className="flex gap-1 items-center"
        >
          <LuPowerOff className="text-blue-300" />
          <h2>Log Out</h2>
        </div>
      </section>
    );
  } else {
    return <Loading />;
  }
}
