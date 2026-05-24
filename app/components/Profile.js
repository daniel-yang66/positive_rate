"use client";
import { useState, useEffect } from "react";
import { account } from "../lib/appwrite";
import { useRouter } from "next/navigation";
import Title from "./Title";
import { LuCircleX } from "react-icons/lu";
import Loading from "./Loading";
import { notify } from "../commonFunctions.js/Toast";

export default function Profile() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function getUser() {
    try {
      const user = await account.get();
      setName(user.name);
      setEmail(user.email);
    } catch {
      notify("Failed to get user details", "err");
    }
  }

  useEffect(() => {
    getUser();
  }, []);

  async function Update(type) {
    setLoading(true);

    if (type === "pass" && password.trim().length !== 0) {
      try {
        const user = await account.updatePassword({
          password: password,
        });
      } catch {
        notify("Error updating password", "err");
      } finally {
        setLoading(false);
      }
    } else if (type === "name" && name.trim().length !== 0) {
      try {
        const user = await account.updateName({
          name: name,
        });
      } catch {
        notify("Error updating name", "err");
      } finally {
        setLoading(false);
      }
    } else if (type === "email" && email.trim().length !== 0) {
      try {
        const user = await account.updateEmail({
          email: password,
        });
      } catch {
        notify("Error updating email", "err");
      } finally {
        setLoading(false);
      }
    }
  }

  if (!loading) {
    return (
      <section className="relative grid gap-2 justify-items-center font-semibold text-slate-900 z-[30] text-md">
        <div className="flex gap-2 items-center">
          <LuCircleX
            className="absolute top-1 right-1 text-red-400 font-bold text-xl"
            onClick={() => {
              setLoading(false);
              router.push("/dashboard");
            }}
          />
          <Title />
          <h2 className="text-xl font-bold text-slate-400">|</h2>
          <h2 className="text-xl font-bold text-slate-400">Profile</h2>
        </div>
        <div className="bg-slate-700 rounded-lg md:w-[30vw] grid gap-4 justify-items-center p-2">
          <div className="flex items-end gap-2">
            <div className="grid gap-1">
              <p className="text-slate-400">E-mail</p>

              <input
                className="rounded-lg w-[75vw] md:w-[20vw] h-[5vh] bg-slate-400 p-2 "
                placeholder="E-mail"
                type="text"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
              />
            </div>
            <button
              onClick={() => {
                Update("email");
              }}
              className="bg-emerald-400 rounded-xl p-2"
            >
              <h2>Update</h2>
            </button>
          </div>

          <div className="flex items-end gap-2">
            <div className="grid gap-1">
              <p className="text-slate-400">Name</p>

              <input
                className="rounded-lg w-[75vw] md:w-[20vw] h-[5vh] bg-slate-400 p-2 "
                placeholder="Full Name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                }}
              />
            </div>
            <button
              onClick={() => {
                Update("name");
              }}
              className="bg-emerald-400 rounded-xl p-2"
            >
              <h2>Update</h2>
            </button>
          </div>
          <div className="flex items-end gap-2">
            <div className="grid gap-1">
              <p className="text-slate-400">New Password</p>

              <input
                className="rounded-lg w-[75vw] md:w-[20vw] h-[5vh] bg-slate-400 p-2 "
                placeholder="Password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                }}
              />
            </div>
            <button
              onClick={() => {
                Update("pass");
              }}
              className="bg-emerald-400 rounded-xl p-2"
            >
              <h2>Update</h2>
            </button>
          </div>
        </div>
      </section>
    );
  } else {
    return <Loading />;
  }
}
