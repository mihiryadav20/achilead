"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { signIn, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignIn = async () => {
    setIsLoading(true);
    await signIn("linkedin", { callbackUrl: "/dashboard" });
  };

  useEffect(() => {
    if (session && session.user) {
      router.push("/dashboard");
    }
  }, [session, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-black">Loading...</div>
      </div>
    );
  }

  if (session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-black">Redirecting to dashboard...</div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50 text-black relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        {/* Horizontal beams */}
        <div
          className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-400/60 to-transparent animate-pulse"
          style={{ animationDuration: "3s" }}
        ></div>
        <div
          className="absolute top-2/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent animate-pulse"
          style={{ animationDuration: "4s", animationDelay: "1s" }}
        ></div>

        {/* Vertical beams */}
        <div
          className="absolute top-0 left-1/3 w-px h-full bg-gradient-to-b from-transparent via-blue-400/60 to-transparent animate-pulse"
          style={{ animationDuration: "5s", animationDelay: "0.5s" }}
        ></div>
        <div
          className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-blue-500/50 to-transparent animate-pulse"
          style={{ animationDuration: "3.5s", animationDelay: "2s" }}
        ></div>

        {/* Diagonal beams */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div
            className="absolute top-1/2 left-1/2 w-96 h-px bg-gradient-to-r from-transparent via-blue-500/55 to-transparent rotate-45 origin-center animate-pulse"
            style={{ animationDuration: "4.5s", animationDelay: "1.5s" }}
          ></div>
          <div
            className="absolute top-1/3 right-1/3 w-80 h-px bg-gradient-to-r from-transparent via-blue-400/45 to-transparent -rotate-45 origin-center animate-pulse"
            style={{ animationDuration: "6s", animationDelay: "0.8s" }}
          ></div>
        </div>
      </div>

      <header className="flex justify-center items-center px-8 py-6 relative z-10">
        <nav className="flex items-center">
          <div className="text-xl font-semibold text-black font-montserrat">achileads</div>
        </nav>
      </header>

      <section className="flex items-center justify-center min-h-[85vh] px-8 relative z-10">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center gap-20">
            <div className="flex-shrink-0">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Lucid_Origin_A_minimalist_logo_of_Achilles_the_Greek_demigod_w_0-removebg-preview-CX3TTXEyOX2qoKYBl7WgonuBmkxRpi.png"
                alt="Achileads Spartan Helmet Logo"
                width="500"
                height="500"
                className="object-contain"
              />
            </div>

            <div className="flex-1">
              <h1 className="text-6xl md:text-7xl font-bold mb-8 text-black leading-tight">
                Strategise your GTM
                <br />
                like a Trojan Horse
              </h1>
              <p className="text-2xl text-gray-600 mb-10 max-w-2xl leading-relaxed">
                Unleash your market potential with our AI-powered GTM strategy tool. Crafted with cutting-edge
                intelligence and seamless execution.
              </p>
              <div className="flex gap-6">
                <Button
                  onClick={handleSignIn}
                  size="lg"
                  disabled={isLoading}
                >
                  <Image
                    src="/linkedin.png"
                    alt="LinkedIn"
                    width={20}
                    height={20}
                  />
                  {isLoading ? "Connecting..." : "Get Started with LinkedIn"}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                >
                  View Demo
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
