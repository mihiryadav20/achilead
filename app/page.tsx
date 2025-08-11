"use client";

import { Button } from "@/components/ui/button";
import { BackgroundBeams } from "@/components/ui/background-beams";
import Image from "next/image";
import { signIn, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignIn = async () => {
    setIsLoading(true);
    await signIn("linkedin", { callbackUrl: "/dashboard" });
  };

  useEffect(() => {
    if (session && session.user) {
      console.log("Logged in as:", session.user.name);
      router.push("/dashboard");
    }
  }, [session, router]);

  if (status === "loading") {
    return (
      <div className="relative min-h-screen w-full bg-neutral-950 flex flex-col items-center justify-center antialiased">
        <div className="text-neutral-200">Loading...</div>
        <BackgroundBeams />
      </div>
    );
  }

  if (session) {
    return (
      <div className="relative min-h-screen w-full bg-neutral-950 flex flex-col items-center justify-center antialiased">
        <div className="max-w-2xl mx-auto p-4">
          <h1 className="relative z-10 text-lg md:text-7xl bg-clip-text text-transparent bg-gradient-to-b from-neutral-200 to-neutral-600 text-center font-sans font-bold">
            Welcome Back!
          </h1>
          <p className="text-neutral-200 text-center relative z-10 mt-4">
            Redirecting to your dashboard...
          </p>
        </div>
        <BackgroundBeams />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full bg-neutral-950 flex flex-col items-center justify-center antialiased">
      <div className="max-w-2xl mx-auto p-4">
        <h1 className="relative z-10 text-lg md:text-7xl bg-clip-text text-transparent bg-gradient-to-b from-neutral-200 to-neutral-600 text-center font-sans font-bold">
          Welcome to Achileads
        </h1>
        <p className="text-neutral-500 max-w-lg mx-auto my-2 text-sm text-center relative z-10">
        Unleash your market potential with our AI-powered GTM strategy tool.

Crafted with cutting-edge intelligence and seamless execution.
        </p>
        <div className="flex justify-center mt-8">
          <Button 
            onClick={handleSignIn}
            className="relative z-10 flex items-center gap-2"
            size="lg"
            disabled={isLoading}
          >
            <Image
              src="/linkedin.png"
              alt="LinkedIn"
              width={24}
              height={24}
              className="inline-block align-middle"
            />
            {isLoading ? "Connecting..." : "Get Started with LinkedIn"}
          </Button>
        </div>
      </div>
      <BackgroundBeams />
    </div>
  );
}
