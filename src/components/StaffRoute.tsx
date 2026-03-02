import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const StaffRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isStaff, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user || !isStaff) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default StaffRoute;
