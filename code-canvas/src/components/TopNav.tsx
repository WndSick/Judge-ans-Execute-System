import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Code2, LogOut, User, LayoutDashboard, ChevronDown } from "lucide-react";
import { Button } from "./ui/button";
import { logout } from "@/lib/api";

export const TopNav = () => {
  const loc = useLocation();
  const navigate = useNavigate();
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [role, setRole] = useState<string | null>(localStorage.getItem("role"));
  const [email, setEmail] = useState<string | null>(localStorage.getItem("email"));

  useEffect(() => {
    const checkAuth = () => {
      setToken(localStorage.getItem("token"));
      setRole(localStorage.getItem("role"));
      setEmail(localStorage.getItem("email"));
    };
    window.addEventListener("storage", checkAuth);
    const interval = setInterval(checkAuth, 1000);
    return () => {
      window.removeEventListener("storage", checkAuth);
      clearInterval(interval);
    };
  }, []);

  const onProblems = loc.pathname === "/" || loc.pathname.startsWith("/problems/");
  const onContests = loc.pathname.startsWith("/contests");
  const onSubmissions = loc.pathname === "/submissions";
  const onAdmin = loc.pathname.startsWith("/admin");

  const handleLogout = () => {
    logout();
    setToken(null);
    setRole(null);
    setEmail(null);
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Code2 className="h-4 w-4" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="font-display text-lg font-bold tracking-tight">Forge</span>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground/60 hidden sm:inline">Engine</span>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <NavItem to="/" active={onProblems}>Problems</NavItem>
          <NavItem to="/contests" active={onContests}>Contests</NavItem>
          <NavItem to="/submissions" active={onSubmissions}>History</NavItem>
          {role === "admin" && (
            <NavItem to="/admin" active={onAdmin} className="text-primary hover:text-primary/80">
              <span className="flex items-center gap-1.5 font-bold">
                <LayoutDashboard className="h-3.5 w-3.5" />
                Admin
              </span>
            </NavItem>
          )}
        </nav>

        <div className="flex items-center gap-4">
          {token ? (
            <div className="flex items-center gap-2">
              <div className="hidden lg:flex flex-col items-end mr-2">
                <span className="text-xs font-bold text-foreground leading-tight">{email?.split('@')[0]}</span>
                <span className="text-[9px] text-muted-foreground uppercase tracking-widest">{role}</span>
              </div>
              <div className="flex items-center gap-1 p-1 rounded-full border border-border/60 bg-secondary/30">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <User className="h-3.5 w-3.5" />
                </div>
                <button 
                  onClick={handleLogout}
                  className="p-1.5 rounded-full text-muted-foreground hover:text-destructive transition-colors"
                  title="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" size="sm" className="text-xs font-bold uppercase tracking-widest">Sign In</Button>
              </Link>
              <Link to="/register">
                <Button size="sm" className="text-xs font-bold uppercase tracking-widest bg-primary text-primary-foreground shadow-sm">Join</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

const NavItem = ({ to, active, className, children }: { to: string; active?: boolean; className?: string; children: React.ReactNode }) => (
  <Link
    to={to}
    className={`px-4 py-1.5 text-sm font-medium transition-all rounded-md flex items-center ${
      active ? "text-foreground bg-secondary/80 font-semibold" : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
    } ${className}`}
  >
    {children}
  </Link>
);
