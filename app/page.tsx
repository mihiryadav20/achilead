"use client";

import { Button } from "@/components/ui/button";
import { BackgroundBeams } from "@/components/ui/background-beams";
import Image from "next/image";

export default function Home() {
  return (
    <div className="relative min-h-screen w-full bg-neutral-950 flex flex-col items-center justify-center antialiased">
      <div className="max-w-2xl mx-auto p-4">
        <h1 className="relative z-10 text-lg md:text-7xl bg-clip-text text-transparent bg-gradient-to-b from-neutral-200 to-neutral-600 text-center font-sans font-bold">
          Welcome to Generalux
        </h1>
        <p className="text-neutral-500 max-w-lg mx-auto my-2 text-sm text-center relative z-10">
          Experience the future of user interfaces with our cutting-edge design system.
          Built with modern technologies and beautiful animations.
        </p>
        <div className="flex justify-center mt-8">
          <Button 
            onClick={() => alert('Welcome to Generalux!')} 
            className="relative z-10 flex items-center gap-2"
            size="lg"
          >
            <Image
              src="/linkedin.png"
              alt="LinkedIn"
              width={24}
              height={24}
              className="inline-block align-middle"
            />
            Get Started with LinkedIn
          </Button>
        </div>
      </div>
      <BackgroundBeams />
    </div>
  );
}
