"use client";

import { useState } from "react";
import { Button } from "./button";
import { Loader2, Mail } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "./dialog";

interface Company {
  name: string;
  domain?: string;
  // The other properties from the dashboard's Company interface are available
  // but not directly used by this component, so we can keep it simple.
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
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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
      if (data.decisionMakers) {
        setIsDialogOpen(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
        Find Business emails
      </Button>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Decision Makers at {company.name}</DialogTitle>
          <DialogDescription>
            Found the following potential contacts. Email verification is recommended.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 max-h-[60vh] overflow-y-auto pr-2">
          {error && <p className="text-sm text-destructive">{error}</p>}
          {decisionMakers.length > 0 ? (
            <div className="space-y-3">
              {decisionMakers.map((person, index) => (
                <div
                  key={index}
                  className="rounded-lg border bg-card p-3 text-sm"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="font-semibold">{person.name}</p>
                      <p className="text-xs text-muted-foreground">{person.title}</p>
                    </div>
                    <div className="text-right flex-shrink-0 pl-4">
                      <p className="font-mono text-xs md:text-sm">{person.email}</p>
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
                      className="mt-2 block text-xs text-blue-500 hover:underline"
                    >
                      LinkedIn Profile
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No decision maker emails found for this company.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
