import { Outlet } from "react-router-dom";
import LogoutButton from "../components/common/LogoutButton";
import BackButton from "../components/common/BackButton";
import { Link } from "react-router-dom";

const CustomerLayout = () => {
  return (
    <div className="customer-dashboard min-h-screen bg-slate-100">
      <header className="bg-white shadow-sm">
        <div className="customer-dashboard-header max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-orange-500">
            Customer Dashboard
          </h1>
          <div className="flex items-center gap-3">
            <Link
              to="/profile"
              className="rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 transition hover:bg-slate-50"
            >
              My Profile
            </Link>
            <LogoutButton className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition" />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <BackButton />
        <Outlet />
      </main>
    </div>
  );
};

export default CustomerLayout;
