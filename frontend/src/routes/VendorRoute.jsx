import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const VendorRoute = ({children,}) => {
  const { user } = useAuth();

  // NOT LOGGED IN
  if (!user) {
    return (
      <Navigate to="/login" />
    );
  }

  // NOT A VENDOR
  if (user.role !== "vendor") {
    console.log(user)
    return (
      <Navigate to="/" />
    );
  }
  //
  // ALLOW ACCESS
  return children;
};

export default VendorRoute;