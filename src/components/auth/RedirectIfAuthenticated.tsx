import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

type UserType = 'admin' | 'company' | 'candidate';

interface RedirectIfAuthenticatedProps {
  children: React.ReactNode;
}

const dashboardPaths: Record<UserType, string> = {
  admin: '/admin',
  company: '/empresa',
  candidate: '/candidato',
};

export function RedirectIfAuthenticated({ children }: RedirectIfAuthenticatedProps) {
  const { user, isAuthenticated } = useAuth();

  if (isAuthenticated && user) {
    const redirectPath = dashboardPaths[user.type];
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
}
