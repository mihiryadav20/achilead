import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Using Azure AI Foundry for the agent
    const response = await fetch('https://yadavmihirsanjay-8302-resource.services.ai.azure.com/models/chat/completions?api-version=2024-05-01-preview', {
      method: 'POST',
      headers: {
        'api-key': `${process.env.AZURE_AI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'grok-3-2', // Using Grok-3-2 model from Azure AI Foundry
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant for GeneralUX, a platform that helps businesses find prospects and LinkedIn profiles for their target markets. When given a target industry or market, provide ONLY the following information:\n\n1. Market Analysis: Brief overview of growth trends and current market stage\n2. Prospect Companies: For each company, provide only:\n   - Company name\n   - Classification (SME or Large Enterprise)\n   - Location (city, country)\n   - Website URL\n   - Domain name (e.g., example.com)\n\nDo not include any additional information such as LinkedIn profiles, detailed company descriptions, emails, phone numbers, or other data. Keep the response concise and focused on these specific requirements only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 4096,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Azure AI API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to generate response from Azure AI' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      response: data.choices[0]?.message?.content || 'No response generated'
    });

  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
