"use client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { LuPlane } from "react-icons/lu";
import Title from "./Title";
import { useRouter, useSearchParams } from "next/navigation";
import { ID } from "../lib/appwrite";
import { notify } from "../commonFunctions.js/Toast";

import { account, getUser } from "../lib/appwrite";
import Loading from "./Loading";
export default function Auth() {
  const [type, setType] = useState("su");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [loggedIn, setLoggedIn] = useState("false");
  const router = useRouter();
  const { replace } = useRouter();
  const searchParams = useSearchParams();

  function HandleAuth(text) {
    if (text === "false") return;
    const params = new URLSearchParams(searchParams);
    text ? params.set("auth", text) : params.delete("auth");
    replace(`/dashboard?${params.toString()}`);
  }

  async function SignUp() {
    if (email.length === 0 || password.length === 0 || name.length === 0) {
      notify("Please fill out form", "err");
      return;
    }
    if (password !== passwordConfirm) {
      notify("Passwords do not match", "err");
      return;
    }

    setLoading(true);

    try {
      const user = await account.create({
        userId: ID.unique(),
        email: email,
        password: password,
        name: name,
      });
      notify("Account created!", "success");
      setType("si");
    } catch (err) {
      notify(err.message, "err");
    } finally {
      setLoading(false);
    }
  }

  async function SignIn() {
    if (email.length === 0 || password.length === 0) return;
    setLoading(true);
    try {
      const session = await account.createEmailPasswordSession({
        email: email,
        password: password,
      });
      router.push("/dashboard");
      HandleAuth("true");
      notify("Signed In!", "success");
    } catch (err) {
      notify(err.message, "err");
      HandleAuth("false");
    } finally {
      setLoading(false);
    }
  }

  async function ResetPassword() {
    setLoading(true);
    try {
      const recover = await account.createRecovery({
        email: email,
        url: "https://positiverate.vercel.app/recovery",
      });
      notify("Recovery E-mail Sent!", "success");
    } catch (err) {
      notify(err.message, "err");
    } finally {
      setLoading(false);
    }
  }

  const getSliderPosition = () => {
    if (type) {
      return type === "su" || type === "reset" ? 0 : 1;
    }
  };

  useEffect(() => {
    getUser(null, null, setLoggedIn, "auth");
  }, []);

  useEffect(() => {
    loggedIn === "success" ? HandleAuth("true") : HandleAuth("false");
  }, [loggedIn]);

  if (!loading) {
    return (
      <section className="grid gap-2 justify-items-center font-semibold text-slate-900 z-[30] -mt-[7vh] md:mt-0">
        <div className="flex gap-2 items-center">
          <Title />
          <h2 className="text-xl font-bold text-slate-400">|</h2>
          <h2 className="text-xl font-bold text-slate-400">Authentication</h2>
        </div>

        <div className="bg-slate-700 rounded-lg md:w-[30vw] grid gap-4 justify-items-center p-2">
          <div className="flex gap-4 bg-blue-400 rounded-md relative items-center w-4/5 font-semibold  h-6">
            <motion.div
              className="absolute bg-blue-200 rounded-md shadow-sm h-full w-1/2"
              initial={false}
              animate={{
                x: getSliderPosition() * 100 + "%",
                width: "50%",
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
              }}
            />

            <div
              className="flex justify-center w-1/2 relative z-10 rounded-md transition-colors duration-200 hover:cursor-pointer"
              onClick={() => setType("su")}
            >
              Sign Up
            </div>
            <div
              className="flex justify-center w-1/2 relative z-10 rounded-md transition-colors duration-200 hover:cursor-pointer"
              onClick={() => setType("si")}
            >
              Log In
            </div>
          </div>
          <input
            className="rounded-lg w-[90vw] md:w-[20vw] h-[5vh] bg-slate-400 p-2 "
            placeholder="E-mail"
            type="text"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
          />
          {type === "su" ? (
            <input
              className="rounded-lg w-[90vw] md:w-[20vw] h-[5vh] bg-slate-400 p-2 "
              placeholder="Full Name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
              }}
            />
          ) : (
            <></>
          )}
          {type === "su" || type === "si" ? (
            <input
              className="rounded-lg w-[90vw] md:w-[20vw] h-[5vh] bg-slate-400 p-2 "
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
              }}
            />
          ) : (
            <></>
          )}
          {type === "su" ? (
            <input
              className="rounded-lg w-[90vw] md:w-[20vw] h-[5vh] bg-slate-400 p-2 "
              placeholder="Confirm Password"
              type="password"
              value={passwordConfirm}
              onChange={(e) => {
                setPasswordConfirm(e.target.value);
              }}
            />
          ) : (
            <></>
          )}
          <button
            onClick={() => {
              type !== "reset"
                ? type === "su"
                  ? SignUp()
                  : SignIn()
                : ResetPassword();
            }}
            className="flex gap-2 items-center bg-emerald-400 rounded-xl p-2"
          >
            <LuPlane className="text-lg font-bold" />
            <h2>
              {type !== "reset"
                ? type === "su"
                  ? "Create Account"
                  : "Log In"
                : "Send E-mail"}
            </h2>
          </button>

          {type !== "reset" ? (
            <h2
              onClick={() => setType("reset")}
              className="text-blue-300 text-md"
            >
              Forgot password?
            </h2>
          ) : (
            <></>
          )}
        </div>
      </section>
    );
  } else {
    return <Loading />;
  }
}
