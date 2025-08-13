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

interface Company {
  name: string;
  description?: string;
  domain?: string;
  website?: string;
}

// Function to parse companies from the AI response
function parseCompaniesFromResponse(text: string): Company[] {
  const companies: Company[] = [];
  const lines = text.split(/\n/);

  // Build blocks for each company using numbered or bulleted list starts
  const blocks: { header: string; body: string[] }[] = [];
  let current: { header: string; body: string[] } | null = null;
  const itemStart = /^\s*(?:\d+[\.:\)]|[-*•])\s+(.*)$/;

  for (const raw of lines) {
    const line = raw.replace(/\r$/, '');
    const m = line.match(itemStart);
    if (m) {
      if (current) blocks.push(current);
      current = { header: m[1].trim(), body: [] };
    } else if (current) {
      current.body.push(line.trim());
    }
  }
  if (current) blocks.push(current);

  for (const blk of blocks) {
    const firstLine = blk.header.trim();

    // Extract name (before a common separator if present)
    let name = firstLine;
    const sepMatch = firstLine.match(/\s[-–—:|]\s/);
    if (sepMatch) {
      const idx = firstLine.search(/\s[-–—:|]\s/);
      if (idx > 0) name = firstLine.slice(0, idx).trim();
    }
    name = name.replace(/\*+/g, '').trim();

    // Compose full block text for description/domain extraction
    const full = [blk.header, ...blk.body].join('\n').trim();

    // Extract domain (labeled or plain)
    let domain = '';
    const labeled = full.match(/(?:^|\n)\s*(?:Domain(?: name)?|Website)\s*[:\-]\s*([a-z0-9.-]+\.[a-z]{2,})(?!\S)/i);
    if (labeled) {
      domain = labeled[1].toLowerCase();
    } else {
      const anyDomain = full.match(/(?:https?:\/\/)?([a-z0-9-]+(?:\.[a-z0-9-]+)+)(?:\/\S*)?/i);
      if (anyDomain) domain = anyDomain[1].toLowerCase();
    }
    const website = domain ? `https://${domain}` : '';

    // Build description: remove labeled domain lines and the name prefix from header
    let description = full
      .replace(/(?:^|\n)\s*(?:Domain(?: name)?|Website)\s*[:\-]\s*[^\n]+/gi, '')
      .trim();

    // If header contains separator with intro, prefer that plus body
    const headerIntro = blk.header.match(/\s[-–—:]\s(.+)$/);
    if (headerIntro) {
      description = [headerIntro[1], blk.body.join(' ')].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
    } else {
      // Otherwise use body as description
      description = blk.body.join(' ').replace(/\s+/g, ' ').trim();
    }

    companies.push({ name, description, domain, website });
  }

  return companies;
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [parsedCompanies, setParsedCompanies] = useState<Company[]>([]);

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
          
          // Parse companies from the response
          try {
            const companies = parseCompaniesFromResponse(data.response);
            setParsedCompanies(companies);
          } catch (parseError) {
            console.error('Error parsing companies:', parseError);
            setParsedCompanies([]);
          }
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
                  {parsedCompanies.length === 0 && (
                    <ReactMarkdown>
                      {response}
                    </ReactMarkdown>
                  )}
                  
                  {parsedCompanies.length > 0 && (
                    <div className="mt-6 border-t pt-4">
                      <h3 className="text-lg font-medium mb-3">Prospect Companies</h3>
                      <div className="grid grid-cols-1 gap-4">
                        {parsedCompanies.map((company, index) => (
                          <div key={index} className="border rounded-md p-4 bg-card">
                            <div className="space-y-2">
                              <h4 className="font-medium text-lg">{company.name.replace(/\*+/g, "")}</h4>
                              <div className="text-sm space-y-2">
                                {company.description && (
                                  <div>
                                    {company.description}
                                  </div>
                                )}
                                {company.website && (
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-muted-foreground">Website:</span>
                                    <a
                                      href={company.website}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-500 hover:underline break-all"
                                    >
                                      {company.website.replace(/^https?:\/\//, "")}
                                    </a>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
