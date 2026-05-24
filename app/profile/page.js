import Blur from "../components/Blur";
import Profile from "../components/Profile";

export default function ProfilePage() {
  return (
    <div className="h-[90vh] w-full grid items-center justify-items-center gap-[2vw]">
      <Blur />
      <Profile />
    </div>
  );
}

export const generateMetadata = () => {
  return { title: `Authentication | +Rate` };
};
