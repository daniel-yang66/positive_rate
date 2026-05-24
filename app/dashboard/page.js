import Dashboard from "../components/Dashboard";
import { redirect } from "next/navigation";
import Loading from "../components/Loading";
import { Suspense } from "react";
export default async function DashboardPage({ searchParams }) {
  const params = await searchParams;
  const auth = await params.auth;
  const airport = await params.airport;
  if (auth === "false" || !auth) {
    redirect("/authentication");
  }
  return (
    <div className="w-full">
      <Suspense fallback={<Loading />}>
        <Dashboard />
      </Suspense>
    </div>
  );
}

export const generateMetadata = () => {
  return { title: `Dashboard | +Rate` };
};
