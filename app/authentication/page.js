import Auth from "../components/AuthForm";
import Blur from "../components/Blur";
import Loading from "../components/Loading";
import { Suspense } from "react";

export default function AuthPage() {
  return (
    <Suspense fallback={<Loading />}>
      <div className="h-[90vh] w-full grid items-center justify-items-center gap-[2vw]">
        <Blur />
        <Auth />
      </div>
    </Suspense>
  );
}

export const generateMetadata = () => {
  return { title: `Authentication | +Rate` };
};
