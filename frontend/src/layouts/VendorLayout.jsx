import { Outlet } from "react-router-dom";
import VendorSidebar from "../components/vendor/VendorSidebar";
import BackButton from "../components/common/BackButton";

const VendorLayout = () => {
  return (
    <div className="dashboard-layout min-h-screen flex bg-slate-100">

      {/* SIDEBAR */}
      <VendorSidebar />

      {/* PAGE CONTENT */}
      <main className="dashboard-main min-w-0 flex-1 p-6 overflow-y-auto">
        <BackButton />
        <Outlet />
      </main>
    </div>
  );
};

export default VendorLayout;