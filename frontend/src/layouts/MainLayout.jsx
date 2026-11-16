import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/layouts/Navbar";
import Footer from "../components/layouts/Footer";
import BackButton from "../components/common/BackButton";

const MainLayout = () => {
  const { pathname } = useLocation();
  const showBackButton = pathname.startsWith("/cars/");

  return (
    <div className="min-h-screen flex flex-col">

      {/* NAVBAR */}
      <Navbar />

      {/* PAGE CONTENT */}
      <main className="flex-1">
        {showBackButton && (
          <div className="mx-auto max-w-7xl px-4 pt-4">
            <BackButton />
          </div>
        )}
        <Outlet/>
      </main>

      <Footer />
    </div>
  );
};

export default MainLayout;