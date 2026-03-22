import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const SuperviseeRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, roles, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const isSupervisee = roles.includes("supervisee");

  if (!user || (!isSupervisee && !isAdmin)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default SuperviseeRoute;
