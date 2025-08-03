"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function Profile() {
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
      <div className="min-h-screen w-full flex flex-col items-center justify-center antialiased">
        <div className="text-neutral-200">Loading your profile...</div>
      </div>
    );
  }

  if (!session || !session.user) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center antialiased">
        <div className="text-neutral-200">Redirecting...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center antialiased">
      <div className="max-w-4xl mx-auto p-8 w-full">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Your Profile</CardTitle>
              <CardDescription>Your LinkedIn account information</CardDescription>
            </div>
            <div className="flex space-x-4">
              <Button 
                onClick={() => router.push("/dashboard")}
                variant="outline"
              >
                Back to Dashboard
              </Button>
              <Button 
                onClick={handleSignOut}
                variant="destructive"
              >
                Sign Out
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            <div className="flex flex-col">
              
              <div className="flex items-center space-x-4 mb-6">
                {session.user.image ? (
                  <Image
                    src={session.user.image}
                    alt="Profile"
                    width={80}
                    height={80}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full flex items-center justify-center">
                    <span>
                      {session.user.name?.charAt(0) || session.user.email?.charAt(0) || "U"}
                    </span>
                  </div>
                )}
                <div>
                  <h3 className="font-medium">
                    {session.user.name || "LinkedIn User"}
                  </h3>
                  <p>
                    {session.user.email || "No email provided"}
                  </p>
                </div>
              </div>
              <div className="space-y-4 w-full max-w-md">
                
                <Card>
                  <CardContent className="pt-6">
                    <CardTitle className="text-sm mb-2">Full Name</CardTitle>
                    <p>
                      {session.user.name || "Not provided"}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <CardTitle className="text-sm mb-2">Email Address</CardTitle>
                    <p>
                      {session.user.email || "Not provided"}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
