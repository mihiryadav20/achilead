"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast, Toaster } from "sonner";
import ReactMarkdown from "react-markdown";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      setIsLoading(true);
      setResponse("");
      
      try {
        const res = await fetch('/api/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ prompt }),
        });

        const data = await res.json();

        if (data.success) {
          setResponse(data.response);
          toast.success("Response generated successfully!");
        } else {
          toast.error(data.error || "Failed to generate response");
        }
      } catch (error) {
        console.error('Error:', error);
        toast.error("An error occurred while generating response");
      } finally {
        setIsLoading(false);
      }
    }
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
      <Toaster position="top-center" />
      {/* Top right user controls */}
      <div className="absolute top-0 right-0 p-6 flex items-center space-x-4 z-20">
        <Link href="/profile">
          <div className="flex items-center space-x-2 cursor-pointer">
            {session.user.image ? (
              <Image
                src={session.user.image}
                alt="Profile"
                width={32}
                height={32}
                className="rounded-full"
              />
            ) : (
              <div className="w-8 h-8 rounded-full flex items-center justify-center">
                <span>
                  {session.user.name?.charAt(0) || session.user.email?.charAt(0) || "U"}
                </span>
              </div>
            )}
            <span className="hidden sm:inline">{session.user.name || "Profile"}</span>
          </div>
        </Link>
        <Button onClick={handleSignOut} variant="destructive">
          Sign Out
        </Button>
      </div>
      <div className="max-w-4xl mx-auto p-8 w-full">
        <Card>
          <CardHeader>
            <CardTitle>GeneralUX - AI-Powered Market Analysis</CardTitle>
            <CardDescription>Enter your target industry or market to get insights about prospects and key personnel.</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit}>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., 'Find prospects in the fintech industry focusing on payment solutions'"
                className="resize-none min-h-[100px]"
                disabled={isLoading}
              />
              <CardFooter className="px-0 pt-4">
                <Button type="submit" disabled={isLoading || !prompt.trim()}>
                  {isLoading ? "Generating..." : "Generate Response"}
                </Button>
              </CardFooter>
            </form>
          </CardContent>
        </Card>

        {/* Response Card */}
        {(response || isLoading) && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>AI Response</CardTitle>
              <CardDescription>
                {isLoading ? "Generating response..." : "Here's what our AI found:"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="prose prose-sm max-w-none dark:prose-invert whitespace-pre-wrap font-sans text-sm leading-relaxed">
                  <ReactMarkdown>
                    {response}
                  </ReactMarkdown>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
