import Blur from "../components/Blur";
import Recovery from "../components/RecoveryForm";

export default async function AuthPage({ searchParams }) {
  const params = await searchParams;
  const uid = await params.userId;
  const secret = await params.secret;
  return (
    <div className="h-[90vh] w-full grid items-center justify-items-center gap-[2vw]">
      <Blur />
      <Recovery secret={secret} uid={uid} />
    </div>
  );
}

export const generateMetadata = () => {
  return { title: `Password Recovery | +Rate` };
};
