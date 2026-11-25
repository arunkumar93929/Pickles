
import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { getAdminProfile } from "../services/adminService";

function ProtectedAdminRoute() {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    let active = true;

    const verifySession = async () => {
      try {
        await getAdminProfile();

        if (active) {
          setAuthenticated(true);
        }
      } catch (error) {
        if (active) {
          setAuthenticated(false);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    verifySession();

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F2E9]">
        <p className="text-[#33251F] font-medium">
          Verifying admin session...
        </p>
      </div>
    );
  }

  return authenticated ? <Outlet /> : <Navigate to="/admin/login" replace />;
}

export default ProtectedAdminRoute;
