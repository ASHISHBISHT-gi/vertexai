import { useQuery } from "@tanstack/react-query";
import { Link, NavLink, Outlet, useNavigate } from "react-router";
import { buttonClass } from "../components/common/Button";
import { notificationsApi } from "../services/lms";
import { useAuth } from "../store/auth";

const navLink = ({ isActive }: { isActive: boolean }) =>
  `py-1 text-sm ${isActive ? "border-b-2 border-pen font-medium" : "text-muted hover:text-ink"}`;

export default function AppLayout() {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();
  // The bell checks for news every 30 seconds while you're signed in.
  const unread = useQuery({ queryKey: ["notifications-unread"], queryFn: notificationsApi.unreadCount, enabled: !!user, refetchInterval: 30_000, retry: false });
  const count = unread.data?.unread ?? 0;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-8 gap-y-2 px-4 py-3">
          <Link to="/courses" className="text-lg font-bold tracking-tight text-pen">
            Vertexon
          </Link>
          <nav className="flex flex-1 gap-6" aria-label="Main">
            <NavLink to="/courses" className={navLink}>
              Courses
            </NavLink>
            {hasRole("student") && (
              <NavLink to="/dashboard" className={navLink}>
                My learning
              </NavLink>
            )}
            {hasRole("instructor", "admin") && (
              <NavLink to="/teach" className={navLink}>
                Teaching
              </NavLink>
            )}
            {hasRole("admin") && (
              <NavLink to="/admin" className={navLink}>
                Admin
              </NavLink>
            )}
          </nav>
          {user ? (
            <div className="flex items-center gap-4 text-sm">
              <Link to="/notifications" className="text-pen hover:underline" aria-label={count ? `Notifications, ${count} unread` : "Notifications"}>
                Notifications
                {count > 0 && <span aria-hidden className="ml-1.5 inline-block min-w-5 rounded-full bg-highlight px-1.5 text-center text-xs font-semibold text-ink">{count > 99 ? "99+" : count}</span>}
              </Link>
              <span className="text-muted">{user.full_name}</span>
              <button
                className="text-pen hover:underline"
                onClick={async () => {
                  await logout();
                  navigate("/login");
                }}
              >
                Log out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 text-sm">
              <Link to="/login" className="text-pen hover:underline">
                Log in
              </Link>
              <Link to="/register" className={buttonClass("primary")}>
                Sign up
              </Link>
            </div>
          )}
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
