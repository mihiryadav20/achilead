"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { BackgroundBeams } from "@/components/ui/background-beams";
import Image from "next/image";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  if (status === "loading") {
    return (
      <div className="relative min-h-screen w-full bg-neutral-950 flex flex-col items-center justify-center antialiased">
        <div className="text-neutral-200">Loading your profile...</div>
        <BackgroundBeams />
      </div>
    );
  }

  if (!session || !session.user) {
    return (
      <div className="relative min-h-screen w-full bg-neutral-950 flex flex-col items-center justify-center antialiased">
        <div className="text-neutral-200">Redirecting...</div>
        <BackgroundBeams />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full bg-neutral-950 flex flex-col items-center justify-center antialiased">
      <div className="max-w-4xl mx-auto p-8">
        <div className="relative z-10 bg-neutral-900/50 backdrop-blur-sm rounded-2xl border border-neutral-800 p-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl md:text-5xl bg-clip-text text-transparent bg-gradient-to-b from-neutral-200 to-neutral-600 font-sans font-bold">
              Welcome to Your Dashboard
            </h1>
            <Button 
              onClick={handleSignOut}
              variant="outline"
              className="border-neutral-700 hover:bg-neutral-800"
            >
              Sign Out
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* User Profile Section */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-neutral-200 mb-4">
                Your LinkedIn Profile
              </h2>
              
              <div className="flex items-center space-x-4 mb-6">
                {session.user.image ? (
                  <Image
                    src={session.user.image}
                    alt="Profile"
                    width={80}
                    height={80}
                    className="rounded-full border-2 border-neutral-600"
                  />
                ) : (
                  <div className="w-20 h-20 bg-neutral-700 rounded-full flex items-center justify-center">
                    <span className="text-neutral-300 text-2xl">
                      {session.user.name?.charAt(0) || session.user.email?.charAt(0) || "U"}
                    </span>
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-medium text-neutral-200">
                    {session.user.name || "LinkedIn User"}
                  </h3>
                  <p className="text-neutral-400">
                    {session.user.email || "No email provided"}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-neutral-800/50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-neutral-300 mb-2">User ID</h4>
                  <p className="text-neutral-200 font-mono text-sm">
                    {session.user.id || "Not available"}
                  </p>
                </div>

                <div className="bg-neutral-800/50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-neutral-300 mb-2">Full Name</h4>
                  <p className="text-neutral-200">
                    {session.user.name || "Not provided"}
                  </p>
                </div>

                <div className="bg-neutral-800/50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-neutral-300 mb-2">Email Address</h4>
                  <p className="text-neutral-200">
                    {session.user.email || "Not provided"}
                  </p>
                </div>
              </div>
            </div>

            {/* Session Information */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-neutral-200 mb-4">
                Session Information
              </h2>

              <div className="space-y-4">
                <div className="bg-neutral-800/50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-neutral-300 mb-2">Authentication Provider</h4>
                  <div className="flex items-center space-x-2">
                    <Image
                      src="/linkedin.png"
                      alt="LinkedIn"
                      width={20}
                      height={20}
                    />
                    <span className="text-neutral-200">LinkedIn</span>
                  </div>
                </div>

                <div className="bg-neutral-800/50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-neutral-300 mb-2">Access Token</h4>
                  <p className="text-neutral-200 font-mono text-xs break-all">
                    {session.accessToken ? 
                      `${session.accessToken.substring(0, 20)}...` : 
                      "Not available"
                    }
                  </p>
                </div>

                <div className="bg-neutral-800/50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-neutral-300 mb-2">Session Status</h4>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-green-400">Active</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-4 bg-blue-900/20 border border-blue-800/30 rounded-lg">
                <h4 className="text-sm font-medium text-blue-300 mb-2">🎉 OAuth Success!</h4>
                <p className="text-blue-200 text-sm">
                  You have successfully authenticated with LinkedIn OAuth2. 
                  Your session is now active and you can access protected resources.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-neutral-800">
            <div className="flex justify-center">
              <Button 
                onClick={() => router.push("/")}
                variant="outline"
                className="border-neutral-700 hover:bg-neutral-800"
              >
                Back to Home
              </Button>
            </div>
          </div>
        </div>
      </div>
      <BackgroundBeams />
    </div>
  );
}
