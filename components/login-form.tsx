"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";

import Logo from "@/assets/Logologin.png";
import LogoLight from "@/assets/loginlogolight.png";
import GoogleLogo from "@/assets/googlelogo.png"; 
import { Eye, EyeOff } from "lucide-react"; // 👀 import icons

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // 👀 new state
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { data: existingUser, error: userCheckError } = await supabase
        .from("users")
        .select("id")
        .eq("email", email)
        .maybeSingle();

      if (userCheckError) {
        console.error("Error checking user:", userCheckError);
        setError("Something went wrong. Please try again.");
        setIsLoading(false);
        return;
      }

      if (!existingUser) {
        setError("Account doesn't exist.");
        setIsLoading(false);
        setPassword("");
        setEmail("");
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          setError("Invalid credentials. Please try again.");
        } else {
          setError(error.message);
        }
        setIsLoading(false);
        return;
      }

      router.push("/protected");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const supabase = createClient();
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/protected`
        },
      });
      if (error) throw error;
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Google login failed");
    }
  };

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="flex flex-col items-center space-y-2 text-center">
        <Link href={"/"}>
          <div className="flex justify-center">
            <Image
              src={LogoLight}
              alt="Logo Light"
              width={200}
              height={200}
              className="block dark:hidden"
            />
            <Image
              src={Logo}
              alt="Logo Dark"
              width={200}
              height={200}
              className="hidden dark:block"
            />
          </div>
        </Link>

        <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
        <CardDescription>
          Enter your credentials to sign in to your account
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* 👀 Password with toggle */}
          <div className="grid gap-2 relative">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/auth/forgot-password"
                className="ml-auto text-sm underline-offset-4 hover:underline"
              >
                Forgot your password?
              </Link>
            </div>
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-2">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Login"}
          </Button>

          <div className="text-center text-sm mt-2">
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/sign-up"
              className="text-indigo-600 dark:text-indigo-400 hover:underline underline-offset-4"
            >
              Sign up
            </Link>
          </div>
        </form>

        <div className="flex items-center gap-2 my-4">
          <div className="h-px flex-1 bg-muted" />
          <span className="text-sm text-muted-foreground">Or continue with</span>
          <div className="h-px flex-1 bg-muted" />
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full flex items-center gap-2 py-5"
          onClick={handleGoogleLogin}
        >
          <Image src={GoogleLogo} alt="Google" width={20} height={20} />
          Continue with Google
        </Button>
      </CardContent>
    </Card>
  );
}
