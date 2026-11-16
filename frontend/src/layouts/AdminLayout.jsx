import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/admin/AdminSidebar";
import BackButton from "../components/common/BackButton";

const AdminLayout = () => {
  return (
    <div className="dashboard-layout min-h-screen flex bg-slate-100">

      {/* SIDEBAR */}
      <AdminSidebar />

      {/* CONTENT */}
      <main className="dashboard-main min-w-0 flex-1 p-6 overflow-y-auto">
        <BackButton />
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;