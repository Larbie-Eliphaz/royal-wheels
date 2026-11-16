import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import API from "../../api/axios";

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [updatingStatuses, setUpdatingStatuses] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const fetchUsers = async () => {
      try {
        const { data } = await API.get("/users/all-users");
        const responseUsers = Array.isArray(data)
          ? data
          : data?.users ?? data?.data?.users;

        if (!Array.isArray(responseUsers)) {
          throw new Error("The users endpoint did not return a users list.");
        }

        if (isMounted) {
          setUsers(responseUsers);
          setErrorMessage("");
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(
            error.response?.data?.message ||
              error.message ||
              "Unable to load users.",
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchUsers();

    return () => {
      isMounted = false;
    };
  }, []);

  const updateUserStatus = async (user, field) => {
    const statusKey = `${user._id}-${field}`;
    if (updatingStatuses.includes(statusKey)) {
      return;
    }

    const value = !user[field];
    setUpdatingStatuses((currentStatuses) => [...currentStatuses, statusKey]);

    try {
      const { data } = await API.patch(`/users/${user._id}/status`, {
        [field]: value,
      });

      setUsers((currentUsers) =>
        currentUsers.map((currentUser) =>
          currentUser._id === user._id
            ? { ...currentUser, ...data.user }
            : currentUser,
        ),
      );
    } catch (error) {
      if (!error?.globalNotificationShown) {
        toast.error(error?.message || "User status update failed.");
      }
    } finally {
      setUpdatingStatuses((currentStatuses) =>
        currentStatuses.filter((key) => key !== statusKey),
      );
    }
  };

  return (
    <div>
      <h1 className="mb-8 text-4xl font-bold">Users</h1>

      {errorMessage && (
        <p
          role="alert"
          className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-red-700"
        >
          {errorMessage}
        </p>
      )}

      <div className="overflow-x-auto rounded-2xl bg-white shadow">
        <table className="w-full min-w-[900px]">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-4 text-left">Name</th>
              <th className="p-4 text-left">Email</th>
              <th className="p-4 text-left">Role</th>
              <th className="p-4 text-left">Verified</th>
              <th className="p-4 text-left">Vendor approval</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500">
                  Loading users...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500">
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((user) => {
                const isVerificationUpdating = updatingStatuses.includes(
                  `${user._id}-isVerified`,
                );
                const isApprovalUpdating = updatingStatuses.includes(
                  `${user._id}-isApproved`,
                );

                return (
                  <tr key={user._id} className="border-t">
                    <td className="p-4">{user.name || "—"}</td>
                    <td className="p-4">{user.email || "—"}</td>
                    <td className="p-4 capitalize">{user.role || "—"}</td>
                    <td className="p-4">
                      <button
                        type="button"
                        disabled={isVerificationUpdating}
                        onClick={() => updateUserStatus(user, "isVerified")}
                        aria-pressed={Boolean(user.isVerified)}
                        className={`rounded-lg px-3 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50 ${
                          user.isVerified
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-amber-100 text-amber-800 hover:bg-amber-200"
                        }`}
                      >
                        {isVerificationUpdating
                          ? "Updating..."
                          : user.isVerified
                            ? "Verified"
                            : "Unverified"}
                      </button>
                    </td>
                    <td className="p-4">
                      {user.role === "vendor" ? (
                        <button
                          type="button"
                          disabled={isApprovalUpdating}
                          onClick={() => updateUserStatus(user, "isApproved")}
                          aria-pressed={Boolean(user.isApproved)}
                          className={`rounded-lg px-3 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50 ${
                            user.isApproved
                              ? "bg-green-100 text-green-700 hover:bg-green-200"
                              : "bg-amber-100 text-amber-800 hover:bg-amber-200"
                          }`}
                        >
                          {isApprovalUpdating
                            ? "Updating..."
                            : user.isApproved
                              ? "Approved"
                              : "Pending"}
                        </button>
                      ) : (
                        <span className="text-sm text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsersPage;
