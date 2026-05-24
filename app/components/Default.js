"use client";
import { useEffect } from "react";
import { getUser } from "../lib/appwrite";
export default function Default({ text }) {
  useEffect(() => {
    getUser();
  }, []);
  return (
    <h1 className="text-[40px] grid self-center justify-self-center font-bold text-slate-300">
      {text}
    </h1>
  );
}
