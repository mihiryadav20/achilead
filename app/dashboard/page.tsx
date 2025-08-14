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
import { CheckCircle } from "lucide-react";
import { EmailFinder } from "@/components/ui/email-finder";

interface Company {
  name: string;
  description: string; // This will hold the full details block for rendering
  domain?: string;
}

// Function to filter out the prospect companies section from the AI response
function filterProspectSection(text: string): string {
  const lines = text.split(/\n/);
  const filteredLines: string[] = [];
  let inProspectSection = false;
  
  for (const line of lines) {
    // Check if we're entering the prospect companies section
    if (line.match(/prospect companies|companies|prospects/i) && line.match(/^#+\s|^\*\*|^##/)) {
      inProspectSection = true;
      continue;
    }
    
    // Skip lines that are part of the prospect section
    if (inProspectSection) {
      // Check if we've reached a new section (starts with # or **)
      if (line.match(/^#+\s|^\*\*/) && !line.match(/prospect companies|companies|prospects/i)) {
        inProspectSection = false;
        filteredLines.push(line);
      }
      // Skip numbered/bulleted items in prospect section
      else if (line.match(/^\s*(?:[0-9]+\.|[-*•])\s*(.+)$/)) {
        continue;
      }
      // Skip empty lines in prospect section
      else if (!line.trim()) {
        continue;
      }
    } else {
      filteredLines.push(line);
    }
  }
  
  return filteredLines.join('\n');
}

// Function to parse companies from the AI response
function parseCompaniesFromResponse(text: string): Company[] {
  const companies: Company[] = [];
  // Split the response into blocks for each company, assuming they start with a number and a bolded name.
  const companyBlocks = text.split(/\n\s*(?:[0-9]+\.|[-*•])\s*\*\*/).slice(1);

  for (const block of companyBlocks) {
    const lines = block.split('\n').map(line => line.trim());
    
    // First line is the company name (without the initial asterisks)
    const name = lines[0].replace(/\*\*$/, '').trim();
    if (!name) continue;

    // The rest of the lines are the description
    const description = lines.slice(1).join('\n');
    
    // Extract domain from the description for the EmailFinder component
    const domainMatch = description.match(/(?:Domain Name|Website):\s*([\w.-]+)/i);
    const domain = domainMatch ? domainMatch[1] : undefined;

    companies.push({ name, description, domain });
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
          toast.success("Response generated successfully!", {
            icon: <CheckCircle className="h-4 w-4 text-green-500" />,
          });
          
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
                            <div className="space-y-3">
                              <h4 className="font-medium text-lg">{company.name}</h4>
                              {company.description && (
                                <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                  <ReactMarkdown>
                                    {company.description}
                                  </ReactMarkdown>
                                </div>
                              )}
                              {company.domain && (
                                <div className="flex items-center gap-2 flex-wrap mt-2 pt-2 border-t">
                                  <EmailFinder company={company} />
                                </div>
                              )}
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
