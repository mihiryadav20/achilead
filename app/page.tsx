"use client";

import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Button onClick={() => alert('Button clicked!')}>Click Me</Button>
    </div>
  );
}
  