import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { register } from "@/lib/api";
import { toast } from "sonner";
import { TopNav } from "@/components/TopNav";
import { AlertCircle } from "lucide-react";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await register({ email, password });
      toast.success("Account created! You can now login.");
      navigate("/login");
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
      toast.error("Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <div className="flex items-center justify-center pt-24 px-6 animate-in fade-in zoom-in-95 duration-300">
        <Card className="w-full max-w-md border-border/60 bg-card/60 backdrop-blur-xl shadow-2xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-display font-bold tracking-tight">Create Account</CardTitle>
            <CardDescription>Join the Forge Engine community of developers</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold animate-in slide-in-from-top-2">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-background/50 border-border/60 focus:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Min. 8 characters"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-background/50 border-border/60 focus:ring-primary"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full font-bold bg-gradient-primary shadow-glow hover:brightness-110 transition-all" disabled={loading}>
                {loading ? "Creating Account..." : "Sign Up"}
              </Button>
              <div className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link to="/login" className="text-primary font-semibold hover:underline">
                  Sign in
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Register;
