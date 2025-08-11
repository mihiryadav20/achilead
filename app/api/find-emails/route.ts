import { NextRequest, NextResponse } from 'next/server';

// Decision maker titles to filter for
const DECISION_MAKER_TITLES = [
  'ceo', 'chief executive officer', 'founder', 'co-founder',
  'cto', 'chief technology officer', 'chief technical officer',
  'cmo', 'chief marketing officer', 'vp', 'vice president',
  'director', 'head of', 'president', 'owner', 'managing director',
  'general manager', 'senior director', 'executive director'
];

interface HunterEmail {
  value: string;
  type: string;
  confidence: number;
  sources: Array<{
    domain: string;
    uri: string;
    extracted_on: string;
    last_seen_on: string;
    still_on_page: boolean;
  }>;
  first_name: string;
  last_name: string;
  position: string;
  seniority: string;
  department: string;
  linkedin: string;
  twitter: string;
  phone_number: string;
}

interface HunterResponse {
  data: {
    domain: string;
    disposable: boolean;
    webmail: boolean;
    accept_all: boolean;
    pattern: string;
    organization: string;
    country: string;
    state: string;
    emails: HunterEmail[];
  };
  meta: {
    results: number;
    limit: number;
    offset: number;
    params: {
      domain: string;
      company: string;
      type: string;
      seniority: string;
      department: string;
    };
  };
}

function isDecisionMaker(position: string, seniority: string): boolean {
  if (!position) return false;
  
  const lowerPosition = position.toLowerCase();
  const lowerSeniority = seniority?.toLowerCase() || '';
  
  // Check if position contains decision maker keywords
  const hasDecisionMakerTitle = DECISION_MAKER_TITLES.some(title => 
    lowerPosition.includes(title)
  );
  
  // Check seniority level
  const isHighSeniority = ['senior', 'executive', 'c-level'].some(level =>
    lowerSeniority.includes(level)
  );
  
  return hasDecisionMakerTitle || isHighSeniority;
}

export async function POST(request: NextRequest) {
  try {
    const { domain, companyName } = await request.json();

    if (!domain && !companyName) {
      return NextResponse.json(
        { error: 'Either domain or company name is required' },
        { status: 400 }
      );
    }

    if (!process.env.HUNTER_IO_API_KEY) {
      return NextResponse.json(
        { error: 'Hunter.io API key not configured' },
        { status: 500 }
      );
    }

    // Build Hunter.io API URL
    const baseUrl = 'https://api.hunter.io/v2/domain-search';
    const params = new URLSearchParams({
      api_key: process.env.HUNTER_IO_API_KEY,
      limit: '10', // Limit to 10 results to match Hunter.io plan restrictions
      type: 'personal' // Focus on personal emails, not generic ones
    });

    if (domain) {
      params.append('domain', domain);
    } else if (companyName) {
      params.append('company', companyName);
    }

    const hunterUrl = `${baseUrl}?${params.toString()}`;

    const response = await fetch(hunterUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Hunter.io API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to fetch emails from Hunter.io' },
        { status: response.status }
      );
    }

    const hunterData: HunterResponse = await response.json();

    // Filter for decision makers only
    const decisionMakerEmails = hunterData.data.emails
      .filter(email => isDecisionMaker(email.position, email.seniority))
      .map(email => ({
        email: email.value,
        name: `${email.first_name} ${email.last_name}`.trim(),
        title: email.position,
        confidence: email.confidence,
        department: email.department,
        seniority: email.seniority,
        linkedin: email.linkedin,
        sources: email.sources?.length || 0
      }))
      .sort((a, b) => b.confidence - a.confidence); // Sort by confidence

    return NextResponse.json({
      success: true,
      company: hunterData.data.organization || companyName,
      domain: hunterData.data.domain || domain,
      totalEmails: hunterData.data.emails.length,
      decisionMakers: decisionMakerEmails,
      meta: {
        pattern: hunterData.data.pattern,
        country: hunterData.data.country,
        results: decisionMakerEmails.length
      }
    });

  } catch (error) {
    console.error('Find emails API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
