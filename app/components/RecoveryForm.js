"use client";
import { useState } from "react";
import { LuPlane } from "react-icons/lu";
import Title from "./Title";
import { useRouter } from "next/navigation";
import { account } from "../lib/appwrite";
import Loading from "./Loading";
import { notify } from "../commonFunctions.js/Toast";

export default function Recovery({ uid, secret }) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function ResetPassword() {
    setLoading(true);
    try {
      const reset = account.updateRecovery({
        userId: uid,
        secret: secret,
        password: password,
      });
      router.push("/authentication");
    } catch (err) {
      notify(err.message, "err");
    } finally {
      setLoading(false);
    }
  }

  if (!loading) {
    return (
      <section className="grid gap-2 justify-items-center font-semibold text-slate-900 z-[30]">
        <div className="flex gap-2 items-center">
          <Title />
          <h2 className="text-xl font-bold text-slate-400">|</h2>
          <h2 className="text-xl font-bold text-slate-400">Authentication</h2>
        </div>
        <div className="bg-slate-700 rounded-lg w-[30vw] grid gap-4 justify-items-center p-2">
          <input
            className="rounded-lg w-[20vw] h-[5vh] bg-slate-400 p-2 "
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
            }}
          />

          <button
            onClick={() => {
              ResetPassword();
            }}
            className="flex gap-2 items-center bg-emerald-400 rounded-xl p-2"
          >
            <LuPlane className="text-lg font-bold" />
            <h2>Reset Password</h2>
          </button>
        </div>
      </section>
    );
  } else {
    return <Loading />;
  }
}
