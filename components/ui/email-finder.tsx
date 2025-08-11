"use client";

import { useState } from "react";
import { Button } from "./button";
import { Loader2, Mail } from "lucide-react";

interface Company {
  name: string;
  domain?: string;
  website?: string;
  classification?: string;
  location?: string;
}

interface DecisionMaker {
  email: string;
  name: string;
  title: string;
  confidence: number;
  department?: string;
  seniority?: string;
  linkedin?: string;
}

interface EmailFinderProps {
  company: Company;
}

export function EmailFinder({ company }: EmailFinderProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [decisionMakers, setDecisionMakers] = useState<DecisionMaker[]>([]);
  const [expanded, setExpanded] = useState(false);

  const findEmails = async () => {
    if (!company.domain && !company.name) {
      setError("Company domain or name is required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/find-emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          domain: company.domain,
          companyName: company.name,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch emails");
      }

      const data = await response.json();
      setDecisionMakers(data.decisionMakers || []);
      setExpanded(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-2">
      {!expanded ? (
        <Button
          onClick={findEmails}
          disabled={loading}
          variant="outline"
          size="sm"
          className="flex items-center gap-1 text-xs"
        >
          {loading ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Mail className="h-3 w-3" />
          )}
          Find LinkedIn Profiles
        </Button>
      ) : (
        <div className="mt-2 space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Decision Makers</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(false)}
              className="h-6 text-xs"
            >
              Hide
            </Button>
          </div>
          
          {decisionMakers.length > 0 ? (
            <div className="space-y-2">
              {decisionMakers.map((person, index) => (
                <div
                  key={index}
                  className="rounded-md border border-border bg-card p-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{person.name}</p>
                      <p className="text-muted-foreground">{person.title}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono">{person.email}</p>
                      <p className="text-xs text-muted-foreground">
                        {person.confidence}% confidence
                      </p>
                    </div>
                  </div>
                  {person.linkedin && (
                    <a
                      href={person.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 block text-xs text-blue-500 hover:underline"
                    >
                      LinkedIn Profile
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">
              No decision maker emails found for this company.
            </p>
          )}
          
          {error && (
            <p className="text-xs text-destructive">{error}</p>
          )}
        </div>
      )}
    </div>
  );
}
